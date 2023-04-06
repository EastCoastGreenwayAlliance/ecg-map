import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import Legend from '../../lib/L.Control.Legend';

import { queryZXY } from '../common/api';
import { esriSatellite, ROUTER_WMS_URL, ROUTER_ALERT_POIS_URL, METERS_TO_MILES, METERS_TO_FEET } from '../common/config';

export const POIS_SHOWALL_MINZOOM = 13;  // min zoom to show all Alert Points not on a route
export const POIS_DISTANCE_FROM_ROUTE = 1.0;  // miles
export const POIS_NOTIFY_RANGE = 1.0;  // miles


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

// utility additions to L.LatLng to calculate the bearing from A to B
// as both a compass heading (0=north) and as human-friendly words (Northeast)
L.LatLng.prototype.bearingTo = function (other) {  // eslint-disable-line
  const d2r = L.LatLng.DEG_TO_RAD;
  const r2d = L.LatLng.RAD_TO_DEG;
  const lat1 = this.lat * d2r;
  const lat2 = other.lat * d2r;
  const dLon = (other.lng - this.lng) * d2r;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);  // eslint-disable-line

  let brng = Math.atan2(y, x);
  brng = parseInt(brng * r2d, 10);
  brng = (brng + 360) % 360;
  return brng;
};

L.LatLng.prototype.bearingWordTo = function (other) {  // eslint-disable-line
  const bearing = this.bearingTo(other);
  let bearingword = '';
  if (bearing >= 22 && bearing <= 67) bearingword = 'Northeast';
  else if (bearing >= 67 && bearing <= 112) bearingword = 'East';
  else if (bearing >= 112 && bearing <= 157) bearingword = 'Southeast';
  else if (bearing >= 157 && bearing <= 202) bearingword = 'South';
  else if (bearing >= 202 && bearing <= 247) bearingword = 'Southwest';
  else if (bearing >= 247 && bearing <= 292) bearingword = 'West';
  else if (bearing >= 292 && bearing <= 337) bearingword = 'Northwest';
  else if (bearing >= 337 || bearing <= 22) bearingword = 'North';
  return bearingword;
};

/** Class that integrates Leaflet.JS with React and handles:
    - loading of basemap tiles & map interaction
    - toggling of basemap style from Positron and satellite
    - updating features to be shown on the map such as markers and the highlighted
      portion of the ECG route after a successful search
    - enabling "Locate Me" and "Active Turning"
 */
class LeafletMap extends Component {
  static propTypes = {
    activeTurningEnabled: PropTypes.bool.isRequired,
    isMobile: PropTypes.bool.isRequired,
    reportLocationError: PropTypes.func.isRequired,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    zoom: PropTypes.number.isRequired,
    onMapMove: PropTypes.func.isRequired,
    fetchLocationGeocode: PropTypes.func.isRequired,
    cancelRoutingLocation: PropTypes.func.isRequired,
    acceptRoutingLocation: PropTypes.func.isRequired,
    setMapZoomOnGeocode: PropTypes.func.isRequired,
    zoomMapToGeocodes: PropTypes.bool.isRequired,
    geocodeResult: PropTypes.object,
    startLocation: PropTypes.object,
    endLocation: PropTypes.object,
    route: PropTypes.object,
    updateActiveTurning: PropTypes.func.isRequired,
    disableActiveTurning: PropTypes.func.isRequired,
    selectPoi: PropTypes.func.isRequired,
    updateNearbyPois: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    const { lat, lng, zoom } = props;
    const hashZXY = queryZXY();

    this.map = null;
    this.baseLayers = {
      Greyscale: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
        maxZoom: 18,
        zIndex: 0,
      }),
      Satellite: L.tileLayer(esriSatellite, {
        maxZoom: 18,
        zIndex: 0,
      }),
    };

    this.mapOptions = {
      center: [
        hashZXY.lat && hashZXY.lng ? hashZXY.lat : lat,
        hashZXY.lat && hashZXY.lng ? hashZXY.lng : lng,
      ],
      layers: [this.baseLayers.Greyscale],
      // maxBounds: maxGeoBounds,
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

    // icon for the "active turning" feature
    this.gpsIcon = new L.Icon({
      iconUrl: '/assets/icons/youarehere.png',
      iconSize: [25, 25],
      iconAnchor: [12, 12],
      popupAnchor: [12, -12]
    });

    // define the trail WMS
    this.thegreenway = L.tileLayer.wms(ROUTER_WMS_URL, {
      format: 'image/png',
      transparent: 'TRUE',
      layers: 'ecgroutelines_live',
      zIndex: 5,
    });

    // define the labels TileLayer
    this.labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      zIndex: 100,
    });

    // layer to store searchResults (route, markers, etc) when user is searching for a location
    this.searchResults = L.featureGroup();
    // and the subset of specifically the route segments
    this.searchRoute = undefined;

    // leaflet-locate control instance (mobile only)
    this.locateMe = null;
  }

  componentDidMount() {
    const { startLocation, endLocation, route } = this.props;

    // set up the Leaflet map
    this.initMap();
    this.initBindActiveTurningLocationWatcher();
    this.initActiveTurningPoiNotifications();
    // this.initFakeGeolocationClicks();  // testing: click to pretend we're driving!

    // load the always-on set of alert POIs onto the map
    // visible close-up, see the "zoomend" handler
    this.initAlwaysOnAlertPois();

    // if we received preloaded state for start and end locations, show those on the map
    if (startLocation.accepted && startLocation.coordinates.length && endLocation.accepted
      && endLocation.coordinates.length) {
      this.zoomRouteExtent(startLocation, endLocation);
    }

    // if we received preloaded state for just a start location
    if (startLocation.accepted && startLocation.coordinates.length && !endLocation.accepted) {
      this.zoomToNearestSegment(startLocation);
    }

    // if the app state already has routing.response data to test,
    // add it to the map and set the map view to it
    if (route.response && startLocation.accepted && endLocation.accepted) {
      this.zoomRouteExtent(startLocation, endLocation);
      this.renderRouteHighlight(route.response);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { activeTurningEnabled, geocodeResult, startLocation, endLocation, route } = nextProps;

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
    } else if (!route.response && this.props.route.response) {
      this.clearRouteHighlight();
    }

    /* Handles enabling & disabling of "active turning" */
    if (activeTurningEnabled && !this.props.activeTurningEnabled) {
      this.enableActiveTurning();
    }
    if (!activeTurningEnabled && this.props.activeTurningEnabled) {
      this.disableActiveTurning();
    }
  }

  shouldComponentUpdate() {
    // Let Leaflet handle this part of the DOM, not React!
    // NOTE: life cycle methods componentWillUpdate and componentDidUpdate will never get called
    return false;
  }

  setMapTooltip (tooltiptext, latlng) {
    // tooltiptext may be null to clear the tooltip
    this.map.openPopup(tooltiptext, latlng);
  }

  initMap() {
    // sets up the Leaflet map
    const { onMapMove, disableActiveTurning } = this.props;
    const { isMobile } = this.props;

    // instantiate the map and add a reference to it
    this.map = L.map('map', this.mapOptions);

    // useful for debugging where you are, or for entering manual locations for testing
    /*
    this.map.on('moveend', () => {
      console.log([ this.map.getCenter().lat, this.map.getCenter().lng ]);  // eslint-disable-line
    });
    */

    // add the greenway trail WMS, then the always-on labels overlay after it
    this.map.addLayer(this.thegreenway);
    this.map.addLayer(this.labels);

    // "locate me" feature only available on mobile devices
    // import the code for the Leaflet-Locate plugin
    import('../../lib/L.Control.Locate')
      .then(() => {
        // add the plugin
        this.locateMe = L.control.locate({
          cacheLocation: true,
          position: 'topright',
          icon: 'btn-locate',
          iconLoading: 'loading',
          locateOptions: {
            enableHighAccuracy: true,
          },
          keepCurrentZoomLevel: true,
          metric: false,
          markerStyle: {
            color: '#136AEC',
            fillColor: '#2A93EE',
            fillOpacity: 1,
            weight: 2,
            opacity: 0.9,
            radius: 5
          },
          stopCallback: disableActiveTurning,
        }).addTo(this.map);
      })
      .catch((error) => { throw error; });

    // add the legend control
    this.legend = new Legend();
    this.legend.addTo(this.map);

    // add the scale bar control
    L.control.scale().addTo(this.map);

    // add the basemap toggle control
    this.layersControl = L.control.layers(this.baseLayers, null);
    this.layersControl.addTo(this.map, { position: 'topright' });

    // add attribution & map zoom buttons at lower-right
    // and use our custom attributions
    this.zoomControl = !isMobile ?
      L.control.zoom({ position: 'bottomright' }).addTo(this.map) : null;

    this.map.on('baselayerchange', (e) => {
      const attr = document.querySelector('.leaflet-control-attribution.leaflet-control');
      switch (e.name) {
        case 'Greyscale':
          attr.innerHTML = '© <a target="_blank" href="https://carto.com/">CARTO</a> © <a target="_blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
          break;
        case 'Detailed Streets':
          attr.innerHTML = 'Tiles © Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012';
          break;
        case 'Satellite':
          attr.innerHTML = 'Tiles © Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
          break;
        default:
          return null;
      }
    });
    this.map.fire('baselayerchange', { name: 'Greyscale' });

    // update the URL hash with zoom, lat, lng
    this.map.on('moveend', (e) => {
      if (e && e.target) {
        const zoom = e.target.getZoom();
        const latLng = e.target.getCenter();
        onMapMove(zoom, latLng.lat, latLng.lng);
      }
    });

    // add the search results feature group to the map for storing markers & paths
    this.searchResults.addTo(this.map);

    // create FeatureGroups for storing all Alert POIs and POIs on the visible route
    // allpois = populated here at startup, see zoomend handler for show/hide
    // routepois = always visible, populated in renderRouteHighlight()
    this.map.allpois = L.featureGroup([]);
    this.map.routepois = L.featureGroup([]).addTo(this.map);
    this.map.on('zoomend', () => {
      if (this.map.getZoom() >= POIS_SHOWALL_MINZOOM) {
        this.map.addLayer(this.map.allpois);
      } else {
        this.map.removeLayer(this.map.allpois);
      }
    });
    this.map.fire('zoomend');

    // click handler on the map, to fill in a startLocation or endLocation if we don't have one yet
    // as an alternative to typing an address for geocoding
    // the input boxes and geocoder accept string "lng,lat" so we can just drop the click coords in
    this.map.on('click', (event) => {
      const { startLocation, endLocation, fetchLocationGeocode } = this.props;

      const coordstring = `${event.latlng.lat.toFixed(6)},${event.latlng.lng.toFixed(6)}`;
      if (!startLocation.accepted) {
        fetchLocationGeocode(coordstring, true);
      } else if (!endLocation.accepted) {
        fetchLocationGeocode(coordstring, true);
      }
    });
  }

  initFakeGeolocationClicks() {
    // for testing routing: click the map calls a locationfound event,
    // so you can click your way as if walking/./driving
    // note: this won't move the geo-accuracy circle, cuz that's hardcoded into L.locate()
    // but will trigger our own locationfound events such as active turning
    this.map.on('click', (event) => {
      this.map.fire('locationfound', {
        latlng: event.latlng,
      });
    });
  }

  initAlwaysOnAlertPois() {
    this.ajaxFetchAlertPoiMarkers((poimarkers) => {
      poimarkers.forEach((marker) => {
        marker.addTo(this.map.allpois);
      });
    });
  }

  ajaxFetchAlertPoiMarkers(andthencallback) {
    const { selectPoi } = this.props;

    const poisxhr = new XMLHttpRequest();
    poisxhr.open('GET', ROUTER_ALERT_POIS_URL);
    poisxhr.onload = () => {
      if (poisxhr.status !== 200) return;

      // construct a list of L.marker items
      const markerlist = [];
      const poidata = JSON.parse(poisxhr.responseText);
      poidata.rows.forEach((poi) => {
        if (!poi.lat || !poi.lng) return; // missing location, happens

        const marker = L.marker([poi.lat, poi.lng], {
          title: poi.name,
          poi,  // the poi's own metadata
          icon: L.divIcon({
            className: `poi-marker poi-marker-${poi.type}`,
          }),
        })
        .on('click', () => {
          selectPoi(poi);
        });

        markerlist.push(marker);
      });

      // hand the list off to the callback
      if (andthencallback) {
        andthencallback(markerlist);
      }
    };
    poisxhr.send();
  }

  initActiveTurningPoiNotifications() {
    this.map.on('locationfound', (event) => {
      const { activeTurningEnabled, updateNearbyPois } = this.props;
      const here = event.latlng;

      if (!activeTurningEnabled || !this.searchRoute) return;  // only during active turning

      const nearby = this.map.routepois.getLayers().map((poi) => {
        const poilatlng = poi.getLatLng();
        const miles = poilatlng.distanceTo(here) / METERS_TO_MILES;
        const bearing = here.bearingWordTo(poilatlng);

        return {  // extract POI info from L.Marker, add mileage and bearing
          ...poi.options.poi,
          miles,
          bearing,
        };
      })
      .filter(nrb => nrb.miles <= POIS_NOTIFY_RANGE);
      // console.log(['Nearby POIs', nearby ]);  // eslint-disable-line

      // hand off these nearby POIs to redux for display
      updateNearbyPois(nearby);
    });
  }

  initBindActiveTurningLocationWatcher() {
    const { updateActiveTurning, reportLocationError } = this.props;

    // relocated from enableActiveTurning() where it was being re-bound
    // each time activeturning was re-enabled, and thus firing multiple times
    this.map.on('locationfound', (e) => {
      // if there's a route, find where we are on it and the next cue point
      // if we're too far off it, some wording changes (sort of an implicit disclaimer)
      // and we may want to disable some of it if they're far enough off (TBD)
      const activeTurningUpdate = {};

      if (this.searchRoute) {
        // find route segment with closest approach to e.latlng
        const closest = { segment: null, distance: Infinity };
        this.searchRoute.getLayers().forEach((routesegment) => {
          const segmentvertices = routesegment.getLatLngs();
          for (let i = 0, l = segmentvertices.length; i < l - 1; i += 1) {
            const p = this.map.latLngToLayerPoint(e.latlng); // me
            const p1 = this.map.latLngToLayerPoint(segmentvertices[i]); // vertex
            const p2 = this.map.latLngToLayerPoint(segmentvertices[i + 1]); // vertex +1
            const px = L.LineUtil.closestPointOnSegment(p, p1, p2); // closest pixel to me
            const pd = this.map.layerPointToLatLng(px); // pixel back to latlng
            const d = e.latlng.distanceTo(pd); // meters distance between me + closest

            if (d < closest.distance) {
              closest.segment = routesegment;
              closest.distance = d;
            }
          }
        });

        // compose some easy-to-interpolate strings about the situation
        const nearline = closest.segment;
        const nearmile = (closest.distance / METERS_TO_MILES).toFixed(2);
        const nearfeet = Math.round(closest.distance * METERS_TO_FEET);
        const nearname = nearline.properties.title;
        const untilturn = (nearline.properties.meters / METERS_TO_MILES).toFixed(1);

        if (nearmile > 0.1) { // over this = off route, please return to route
          activeTurningUpdate.onpath = false;
          activeTurningUpdate.currentplace = `Return to ${nearname}, ${nearmile} miles`;
          activeTurningUpdate.transition_code = nearline.properties.transition.code;
          activeTurningUpdate.transition_text = nearline.properties.transition.title;
          activeTurningUpdate.distance = `${untilturn} mi`;
        } else if (nearmile > 0.03) { // over this = off route, please return to route
          activeTurningUpdate.onpath = false;
          activeTurningUpdate.currentplace = `Return to ${nearname}, ${nearfeet} feet`;
          activeTurningUpdate.transition_code = nearline.properties.transition.code;
          activeTurningUpdate.transition_text = nearline.properties.transition.title;
          activeTurningUpdate.distance = `${untilturn} mi`;
        } else {
          activeTurningUpdate.onpath = true;
          activeTurningUpdate.currentplace = `On ${nearname}`;
          activeTurningUpdate.transition_code = nearline.properties.transition.code;
          activeTurningUpdate.transition_text = nearline.properties.transition.title;
          activeTurningUpdate.distance = `${untilturn} mi`;
        }
      }

      // hand it off to redux for digestion
      updateActiveTurning(activeTurningUpdate);
    });

    // dispatch error if a Leaflet locate geolocation error occurs
    this.map.on('locationerror', error => reportLocationError(error.message));
  }

  enableActiveTurning() {
    // start geolocation tracking
    // see also the locationfound event handlers which update active turning and nearby POIs
    this.locateMe.start();
  }

  disableActiveTurning() {
    // stop geolocation tracking
    // see also the locationfound event handlers which update active turning and nearby POIs
    this.locateMe.stop();
  }

  fitBoundsToSearchResults(...padding) {
    const options = {};

    if (padding.length > 1) {
      options.paddingTopLeft = padding[0];
      options.paddingBottomRight = padding[1];
    }

    if (padding.length === 1) {
      options.padding = padding[0];
    }

    // fit the map bounds to the search results featureGroup
    this.map.fitBounds(this.searchResults.getBounds(), options);
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
    const { geocodeResult, isMobile } = this.props;
    const { zoomMapToGeocodes } = this.props;

    if (coordinates.length) {
      const padding = isMobile ? [[0, 50], [50, 185]] : [[330, 0], [60, 0]];

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
      if (zoomMapToGeocodes) {
        this.fitBoundsToSearchResults(...padding);
      }
    }
  }

  zoomToNearestSegment(location) {
    const { zoomMapToGeocodes } = this.props;

    this.searchResults.clearLayers();
    this.searchResults.addLayer(L.marker(location.coordinates, {
      icon: location.positionText === 'start' ? this.startIcon : this.endIcon
    }));

    if (zoomMapToGeocodes) {
      this.map.panTo(location.coordinates);
    }
  }

  zoomRouteExtent(startLocation, endLocation) {
    // user has finished selecting their start and end,
    // add start and end points, then zoom the map extent
    const { isMobile } = this.props;
    const { fetchLocationGeocode, cancelRoutingLocation, acceptRoutingLocation } = this.props;
    const { setMapZoomOnGeocode } = this.props;
    const padding = isMobile ? [[0, 50], [50, 160]] : [[330, 0], [60, 0]];

    const startmarker = L.marker(startLocation.coordinates, {
      icon: this.startIcon,
      draggable: true,
    })
      .bindPopup('Start');

    const endmarker = L.marker(endLocation.coordinates, {
      icon: this.endIcon,
      draggable: true,
    })
      .bindPopup('End');

    const recalculateRouteFromMarkers = () => {
      // routing and geocoding are tightly coded into the SearchInput and SearchResults,
      // get marker locations, clear the route, start a new route
      const slat = startmarker.getLatLng().lat;
      const slng = startmarker.getLatLng().lng;
      const elat = endmarker.getLatLng().lat;
      const elng = endmarker.getLatLng().lng;
      const startstring = `${slat.toFixed(6)},${slng.toFixed(6)}`;
      const endstring = `${elat.toFixed(6)},${elng.toFixed(6)}`;

      // accept-location must come after fetchgeocode event has been redux'd, thus timeouts
      cancelRoutingLocation('DONE');

      setTimeout(() => {
        setMapZoomOnGeocode(false);

        fetchLocationGeocode(startstring, true)
          .then(() => {
            setTimeout(() => {
              acceptRoutingLocation('START');

              setTimeout(() => {
                fetchLocationGeocode(endstring, true)
                  .then(() => {
                    setTimeout(() => {
                      acceptRoutingLocation('END');

                      setMapZoomOnGeocode(true);
                    }, 0.5 * 1000);
                  });
              }, 0.5 * 1000);
            }, 0.5 * 1000);
          });
      }, 0.5 * 1000);
    };
    startmarker.on('dragend', () => {
      recalculateRouteFromMarkers();
    });
    endmarker.on('dragend', () => {
      recalculateRouteFromMarkers();
    });

    this.searchResults.clearLayers();
    this.searchResults.addLayer(startmarker);
    this.searchResults.addLayer(endmarker);

    this.fitBoundsToSearchResults(...padding);
  }

  clearRouteHighlight() {
    // the route highlight is already cleared elsewhere
    // but we want to also clear our Route Alert Points
    this.map.routepois.clearLayers();
  }

  renderRouteHighlight(routeGeoJson) {
    if (!routeGeoJson || !routeGeoJson.features || !routeGeoJson.features.length) {
      // don't try adding anything if no GeoJSON was returned from the router
      return;
    }

    const { isMobile } = this.props;
    const padding = isMobile ? [[0, 50], [50, 160]] : [[330, 0], [60, 0]];

    // fetch the POIs from the server, filter to those near route, add to map.routepois for display
    this.ajaxFetchAlertPoiMarkers((poimarkers) => {
      // parse the GeoJSON route and place it onto the map
      // keep each feature's .properties too, we need segment IDs & names for other purposes
      this.searchRoute = L.geoJson(routeGeoJson, {
        onEachFeature: (feature, layer) => {
          layer.setStyle({
            interactive: false,  // no clicks on the route drawing
            clickable: false,  // let them fall to the trail segments in the layer below
          });
          layer.properties = feature.properties;
        }
      });
      this.searchResults.addLayer(this.searchRoute);
      this.fitBoundsToSearchResults(...padding);

      // find Alert Points within X miles of our route, add to routepois
      // tag each POI with a .segmentid attribute
      // so we could relate which POIs are relevant to which segments (CueSheet)
      this.map.routepois.clearLayers();
      poimarkers.forEach((marker) => {
        const poilatlng = marker.getLatLng();
        let shortestdistance = Infinity;
        let segmentid;

        this.searchRoute.getLayers().forEach((routesegment) => {
          const segmentvertices = routesegment.getLatLngs();
          for (let i = 0, l = segmentvertices.length; i < l - 1; i += 1) {
            const p = this.map.latLngToLayerPoint(poilatlng); // this Alert Point
            const p1 = this.map.latLngToLayerPoint(segmentvertices[i]); // vertex
            const p2 = this.map.latLngToLayerPoint(segmentvertices[i + 1]); // vertex +1
            const px = L.LineUtil.closestPointOnSegment(p, p1, p2); // closest pixel to POI
            const pd = this.map.layerPointToLatLng(px); // pixel back to latlng
            const d = poilatlng.distanceTo(pd); // meters distance between POI + vertex

            if (d < shortestdistance) {
              shortestdistance = d;
              segmentid = routesegment.properties.id;
            }
          }
        });

        const isnearby = shortestdistance / METERS_TO_MILES <= POIS_DISTANCE_FROM_ROUTE;
        if (isnearby) {
          marker.options.poi.segmentid = segmentid;
          marker.addTo(this.map.routepois);
        }
      });

      // monkey-patch the pois-on-route into the route structure
      // so they're available to other callers, e.g. CueSheet
      // poisonroute is a set of L.marker but extract them down to just simple objects
      // fortunately we provided the original attributes for just this sort of unforeseen need
      routeGeoJson.properties.pois = this.map.routepois.getLayers().map(poi => poi.options.poi);
    });
  }

  render() {
    return (
      <div className="LeafletMap">
        <div id="map">
          <a href="http://greeninfo.org" className="greeninfo-logo" target="_blank" rel="noopener noreferrer">
            <span>GreenInfo</span>
          </a>
        </div>
      </div>
    );
  }
}

export default LeafletMap;
