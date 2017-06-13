import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

import { configureLayerSource, parseURLHash } from '../common/api';
import configureMapSQL from '../common/sqlQueries';
import { maxGeoBounds, baseURL } from '../common/config';

// set default image paths for Leaflet
// note that "ecg-map" will be set as the first directory if NODE_ENV === 'production'
// this is because Github Pages will be looking for the markers at:
// https://eastcoastgreenwayalliance.github.io/ecg-map/assets/icons/<filename>.png
// while locally it will be localhost:8080/assets/icons/<filename>.png
L.Icon.Default.imagePath = `${baseURL}/assets/icons`;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: `${baseURL}/assets/icons/marker-icon-2x.png`,
  iconUrl: `${baseURL}/assets/icons/marker-icon.png`,
  shadowUrl: `${baseURL}/assets/icons/marker-shadow.png`,
});

class LeafletMap extends Component {
  static propTypes = {
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    zoom: PropTypes.number.isRequired,
    onMapMove: PropTypes.func.isRequired,
    geocodeResult: PropTypes.object,
    startLocation: PropTypes.object,
    endLocation: PropTypes.object,
    route: PropTypes.object
  }

  constructor(props) {
    super(props);
    const { lat, lng, zoom } = props;
    const hashZXY = parseURLHash();

    this.map = null;
    this.baseLayers = {
      positron: L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}@2x.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
        zIndex: 0,
      }),
      satellite: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '<a href="http://www.esri.com/">Esri</a>',
        maxZoom: 18,
        zIndex: 0,
      })
    };

    this.mapOptions = {
      center: [
        hashZXY.lat && hashZXY.lng ? hashZXY.lat : lat,
        hashZXY.lat && hashZXY.lng ? hashZXY.lng : lng,
      ],
      layers: [this.baseLayers.positron],
      maxBounds: maxGeoBounds,
      scrollWheelZoom: false,
      minZoom: 4,
      maxZoom: 18,
      zoom: hashZXY.zoom || zoom,
      zoomControl: false,
    };

    // reference to CARTO sublayer
    this.cartoSubLayer = null;

    // layer to store searchResults in when user is searching for a location
    this.searchResults = L.featureGroup();
  }

  componentDidMount() {
    this.initMap();
  }

  componentWillReceiveProps(nextProps) {
    const { geocodeResult, startLocation, endLocation } = nextProps;

    if (!isEqual(geocodeResult, this.props.geocodeResult)) {
      this.displayGeocodeResult(geocodeResult);
    }

    if (!isEqual(startLocation.coordinates, this.props.startLocation.coordinates)) {
      // handle displaying the start location of the ECG route
      this.displayNearestSegment(startLocation);
    }

    if (startLocation.accepted && !this.props.startLocation.accepted) {
      // zoom to the ECG starting segment
      this.zoomToNearestSegment(startLocation);
    }

    if (!isEqual(endLocation.coordinates, this.props.endLocation.coordinates)) {
      // handle displaying the end location of the ECG route
      this.displayNearestSegment(endLocation);
    }

    if (startLocation.accepted && endLocation.accepted && !this.props.endLocation.accepted) {
      // zoom to the entire route!
      this.showSelectedRoute(startLocation, endLocation);
    }
  }

  shouldComponentUpdate() {
    // Let Leaflet handle this part of the DOM, not React!
    return false;
  }

  initMap() {
    const { onMapMove } = this.props;
    this.map = L.map('map', this.mapOptions);
    this.layersControl = L.control.layers(this.baseLayers, null);
    this.zoomControl = L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    this.layersControl.addTo(this.map, { position: 'topright' });

    // update the URL hash with zoom, lat, lng
    this.map.on('moveend', (e) => {
      if (e && e.target) {
        const zoom = e.target.getZoom();
        const latLng = e.target.getCenter();
        onMapMove(latLng.lat, latLng.lng, zoom);
      }
    });

    this.searchResults.addTo(this.map);

    this.initCartoLayer();

    // for debugging...
    // window.map = this.map;
    // window.searchResults = this.searchResults;
  }

  initCartoLayer() {
    const self = this;
    const layerSource = configureLayerSource(configureMapSQL());
    const options = {
      https: true,
      infowindow: true,
      legends: false,
    };

    // `cartodb` is a global var, refers to CARTO.JS: https://carto.com/docs/carto-engine/carto-js/
    // this creates the crash data tile layer & utf grid for Leaflet
    cartodb.createLayer(self.map, layerSource, options)
      .addTo(self.map, 5) // 2nd param is layer z-index
      .on('done', (layer) => {
        self.cartoLayer = layer;
        layer.on('error', (error) => { throw error; });
        // layer.on('loading', () => self.props.dataLoading(true));
        // layer.on('load', () => self.props.dataLoading(false));
        // store a reference to the Carto SubLayer so we can act upon it later,
        // mainly to update the SQL query based on filters applied by the user
        self.cartoSubLayer = layer.getSubLayer(0);
        // add tooltips to sublayer
          // self.initCartoSubLayerTooltips();
        // add infowindows to sublayer
          // self.initCartoSubLayerInfowindows();
      })
      .on('error', (error) => { throw error; });
  }

  displayGeocodeResult(geocodeResult) {
    const { coordinates, addressFormatted } = geocodeResult;
    const { startLocation, endLocation } = this.props;

    // if it's a new search and the user hasn't accepted start, clear the search layers
    if (!startLocation.accepted || !endLocation.accepted) {
      this.searchResults.clearLayers();
    }

    // add the search result to the map
    this.searchResults.addLayer(
      L.marker(coordinates).bindPopup(addressFormatted)
    );
  }

  displayNearestSegment(location) {
    // adds the nearest ECG segment to the map as well as a line connecting it to
    // the last used location geocode result
    const { coordinates } = location;
    const { geocodeResult } = this.props;

    if (coordinates.length) {
      // display marker showing nearest ECG location
      this.searchResults.addLayer(
        L.marker(location.coordinates).bindPopup(`Nearest ECG ${location.positionText} Location`)
      );
      // connect the nearest ECG location with the user's search
      this.searchResults.addLayer(
        L.polyline([
          geocodeResult.coordinates,
          location.coordinates
        ], {
          color: 'orange',
          dashArray: '12, 8',
          lineCap: 'butt',
        })
      );
      // fit the map extent to the user's search and neareset ECG location
      this.map.fitBounds(this.searchResults.getBounds(), {
        padding: [25, 25]
      });
    }
  }

  zoomToNearestSegment() {
    const searchLayersIDs = this.searchResults.getLayers().map(layer => layer._leaflet_id);
    if (searchLayersIDs.length < 3) return;

    // remove 1st and 3rd layers (original geocode result && dashed line)
    this.searchResults.removeLayer(searchLayersIDs[0]);
    this.searchResults.removeLayer(searchLayersIDs[2]);
    this.map.fitBounds(this.searchResults.getBounds());
  }

  showSelectedRoute(startLocation, endLocation) {
    // user has finished selecting their start and end, show the entire route
    // TO DO: integrate route overlay
    this.searchResults.clearLayers();
    this.searchResults.addLayer(
      L.marker(startLocation.coordinates).bindPopup('Start')
    );
    this.searchResults.addLayer(
      L.marker(endLocation.coordinates).bindPopup('End')
    );
    this.map.fitBounds(this.searchResults.getBounds(), {
      padding: [50, 50]
    });
  }

  render() {
    return (
      <div className="LeafletMap">
        <div id="map" />
      </div>
    );
  }
}

export default LeafletMap;
