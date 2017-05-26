import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as L from 'leaflet';

import baseURL from '../common/config';

// set default image paths for Leaflet
// note the "gin-static-site-starter" as the first directory if NODE_ENV === production
// this is because Github Pages will be looking for the markers at:
// https://greeninfo-network.github.io/gin-static-site-starter/assets/icons/<filename>.png
// while locally it will be localhost:8080/assets/icons/<filename>.png
L.Icon.Default.imagePath = '../../';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: `${baseURL}assets/icons/marker-icon-2x.png`,
  iconUrl: `${baseURL}assets/icons/marker-icon.png`,
  shadowUrl: `${baseURL}assets/icons/marker-shadow.png`,
});

class LeafletMap extends Component {
  static propTypes = {
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    zoom: PropTypes.number.isRequired,
  }

  constructor(props) {
    super(props);
    const { lat, lng, zoom } = props;

    this.baseLayers = {
      positron: L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}@2x.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>',
        maxZoom: 18,
      }),
      satellite: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '<a href="http://www.esri.com/">Esri</a>',
        maxZoom: 18,
      })
    };

    this.mapOptions = {
      center: [lat, lng],
      layers: [this.baseLayers.positron],
      zoom,
      zoomControl: false,
      scrollWheelZoom: false,
    };
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
    this.map = L.map('map', this.mapOptions);
    this.layersControl = L.control.layers(this.baseLayers, null);
    this.zoomControl = L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    this.layersControl.addTo(this.map, { position: 'topright' });
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
