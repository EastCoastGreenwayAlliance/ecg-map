import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

import { configureLayerSource, parseURLHash } from '../common/api';
import configureMapSQL from '../common/sqlQueries';
import { maxGeoBounds } from '../common/config';

// set default image paths for Leaflet
// note that "ecg-map" will be set as the first directory if NODE_ENV === 'production'
// this is because Github Pages will be looking for the markers at:
// https://eastcoastgreenwayalliance.github.io/ecg-map/assets/icons/<filename>.png
// while locally it will be localhost:8080/assets/icons/<filename>.png
L.Icon.Default.imagePath = '/assets/icons';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/assets/icons/marker-icon-2x.png',
  iconUrl: '/assets/icons/marker-icon.png',
  shadowUrl: '/assets/icons/marker-shadow.png',
});

/** Class that integrates Leaflet.JS with React and handles:
    - loading of basemap tiles & map interaction
    - toggling of basemap style from Positron and satellite
    - updating features to be shown on the map such as markers and the highlighted
      portion of the ECG route after a successful search
    - integrating Carto(db).JS for loading the ECG route as a tileLayer
 */
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

    const RouteIcon = L.Icon.extend({
      options: {
        shadowUrl: '/assets/icons/marker-shadow.png',
        iconSize: [38, 47],
        shadowSize: [41, 41],
        iconAnchor: [18, 46],
        shadowAnchor: [10, 40],
        popupAnchor: [2, -40]
      }
    });

    this.startIcon = new RouteIcon({
      iconUrl: '/assets/icons/icon-map-marker-green.png',
      iconRetinaUrl: '/assets/icons/icon-map-marker-green@2x.png'
    });

    this.endIcon = new RouteIcon({
      iconUrl: '/assets/icons/icon-map-marker-red.png',
      iconRetinaUrl: '/assets/icons/icon-map-marker-red.png'
    });

    // reference to CARTO sublayer
    this.cartoSubLayer = null;

    // layer to store searchResults in when user is searching for a location
    this.searchResults = L.featureGroup();
  }

  componentDidMount() {
    this.initMap();
  }

  componentWillReceiveProps(nextProps) {
    const { geocodeResult, startLocation, endLocation, route } = nextProps;

    /* Handles adding the geocode result, if there is one */
    if (geocodeResult && !isEqual(geocodeResult, this.props.geocodeResult)) {
      this.displayGeocodeResult(geocodeResult);
    }

    /* Handles START point rendering and canceling */
    if (startLocation.coordinates.length &&
      !isEqual(startLocation.coordinates, this.props.startLocation.coordinates)) {
      // handle displaying the start location of the ECG route
      this.displayNearestSegment(startLocation);
    }

    if (!startLocation.coordinates.length && this.props.startLocation.coordinates.length) {
      // user canceled this part of the search, clear the map layers
      this.searchResults.clearLayers();
    }

    if (startLocation.accepted && !this.props.startLocation.accepted) {
      // zoom to the ECG starting segment
      this.zoomToNearestSegment(startLocation);
    }

    /* Handles END point rendering and canceling */
    if (endLocation.coordinates.length &&
      !isEqual(endLocation.coordinates, this.props.endLocation.coordinates)) {
      // handle displaying the end location of the ECG route
      this.displayNearestSegment(endLocation);
    }

    if (!endLocation.coordinates.length && this.props.endLocation.coordinates.length) {
      // user canceled this part of the search, clear the map layers
      this.searchResults.clearLayers();
    }

    if (startLocation.accepted && endLocation.accepted && !this.props.endLocation.accepted) {
      // zoom to the route extent
      this.zoomRouteExtent(startLocation, endLocation);
    }

    /* Handles displaying of selection portion of the route */
    if (route.response && !this.props.route.response) {
      this.renderRouteHighlight(route.response);
    }
  }

  shouldComponentUpdate() {
    // Let Leaflet handle this part of the DOM, not React!
    return false;
  }

  initMap() {
    const { onMapMove, route, startLocation, endLocation } = this.props;
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
    window.map = this.map;
    window.searchResults = this.searchResults;

    // if the app state already has routing data, make sure to add it to the map
    // and set the map view to it
    if (route.response && startLocation.coordinates && endLocation.coordinates) {
      this.zoomRouteExtent(startLocation, endLocation);
      this.renderRouteHighlight(route.response);
    }
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
    cartodb.createLayer(self.map, layerSource, options)
      .addTo(self.map, 5) // 2nd param is layer z-index
      .on('done', (layer) => {
        self.cartoLayer = layer;
        layer.on('error', (error) => { throw error; });

        // store a reference to the Carto SubLayer so we can act upon it later,
        // mainly to update the SQL query based on filters applied by the user
        self.cartoSubLayer = layer.getSubLayer(0);

        // TO DO?:
        // add tooltips to sublayer
          // self.initCartoSubLayerTooltips();
        // add infowindows to sublayer
          // self.initCartoSubLayerInfowindows();
      })
      .on('error', (error) => { throw error; });
  }

  fitBoundsToSearchResults(padding) {
    // fit the map bounds to the search results featureGroup
    this.map.fitBounds(this.searchResults.getBounds(), {
      padding,
    });
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
      L.marker(coordinates, {
        icon: startLocation.accepted ? this.endIcon : this.startIcon
      }).bindPopup(addressFormatted)
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
        L.circleMarker(location.coordinates, {
          color: '#1482c5',
          fillColor: '#1482c5',
          opacity: 0.8,
          fillOpacity: 0.6
        }).bindPopup(`Nearest ECG ${location.positionText} Location`)
      );
      // connect the nearest ECG location with the user's search
      this.searchResults.addLayer(
        L.polyline([
          geocodeResult.coordinates,
          location.coordinates
        ], {
          color: '#1482c5 ',
          dashArray: '12, 8',
          lineCap: 'butt',
        })
      );
      // fit the map extent to the user's search and neareset ECG location
      this.fitBoundsToSearchResults([325, 275]);
    }
  }

  zoomToNearestSegment(location) {
    this.searchResults.clearLayers();
    this.searchResults.addLayer(L.marker(location.coordinates, {
      icon: location.positionText === 'start' ? this.startIcon : this.endIcon
    }));
    this.map.panTo(location.coordinates);
  }

  zoomRouteExtent(startLocation, endLocation) {
    // user has finished selecting their start and end,
    // add start and end points, then zoom the map extent
    this.searchResults.clearLayers();
    this.searchResults.addLayer(
      L.marker(startLocation.coordinates, {
        icon: this.startIcon
      }).bindPopup('Start')
    );
    this.searchResults.addLayer(
      L.marker(endLocation.coordinates, {
        icon: this.endIcon
      }).bindPopup('End')
    );
    this.fitBoundsToSearchResults([50, 50]);
  }

  renderRouteHighlight(routeGeoJson) {
    if (!routeGeoJson || !routeGeoJson.features || !routeGeoJson.features.length) {
      // don't try adding anything if no GeoJSON was returned from the router
      return;
    }
    this.searchResults.addLayer(L.geoJson(routeGeoJson));
    this.fitBoundsToSearchResults([50, 50]);
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
