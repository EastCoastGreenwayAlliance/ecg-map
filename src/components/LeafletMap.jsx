import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { configureLayerSource, parseURLHash } from '../common/api';
import configureMapSQL from '../common/sqlQueries';
import { maxGeoBounds } from '../common/config';

class LeafletMap extends Component {
  static propTypes = {
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    zoom: PropTypes.number.isRequired,
    onMapMove: PropTypes.func.isRequired,
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
  }

  componentDidMount() {
    this.initMap();
  }

  componentWillReceiveProps() {
    // do stuff to the map from new props here
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

    this.initCartoLayer();
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

  render() {
    return (
      <div className="LeafletMap">
        <div id="map" />
      </div>
    );
  }
}

export default LeafletMap;
