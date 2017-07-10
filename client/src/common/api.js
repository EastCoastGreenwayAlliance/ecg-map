import queryString from 'query-string';
import { cartoUser, routeSegmentsFieldsVisible } from './config';
import cartocss from './cartocss';
import { defaultRoutingState } from '../reducers';

// App "API" functionality & logic stored in this module
// helper fns
const noop = () => ({});
const isNumber = val => val && typeof val === 'number';

// parses the URL hash to see if it contains zxy settings for the leaflet map
// used to set the map's center and zoom on load
export const parseURLHash = () => {
  const hash = window.location.hash;
  if (!hash.length) return noop();

  const split = hash.split('#')[1];
  if (!split) return noop();

  const zxy = split.split('/');
  if (!zxy.length || zxy.length < 3 || zxy.length > 3) return noop();

  // make sure to ignore any query params if present
  const zxyParsed = zxy.map((n) => {
    const x = n.indexOf('?') === -1 ? n : n.split('?')[0];
    return +x;
  });

  return {
    zoom: isNumber(zxyParsed[0]) ? zxy[0] : null,
    lat: isNumber(zxyParsed[1]) ? zxy[1] : null,
    lng: isNumber(zxyParsed[2]) ? zxy[2] : null,
  };
};

// looks for and parses query parameters representing application state that will
// be preloaded with app, e.g "?start=[x,y]&end=[x,y]" => startLocation: [x,y], endLocation: [x,y]
export const parseURLQueryParams = () => {
  const hash = window.location.hash;
  if (!hash.length) return noop();

  const split = hash.split('?')[1];
  if (!split) return noop();

  return queryString.parse(split);
};

// sets the application state for (geo)routing given parsed URL query params
export const preloadRoutingState = (startEnd) => {
  const { start, end } = startEnd;
  let startCoords;
  let endCoords;

  // validate & parse start coordinates
  if (start && start.length) {
    startCoords = start.map(coord => +coord);
  }

  // validate & parse end coordinates
  if (end && end.length) {
    endCoords = end.map(coord => +coord);
  }

  return {
    ...defaultRoutingState,
    startLocation: {
      ...defaultRoutingState.startLocation,
      accepted: typeof startCoords !== 'undefined',
      coordinates: startCoords || [],
    },
    endLocation: {
      ...defaultRoutingState.endLocation,
      accepted: typeof endCoords !== 'undefined',
      coordinates: endCoords || [],
    }
  };
};

// CARTO layer source object for use with carto(db).js
export const cartoLayerSource = {
  user_name: cartoUser,
  type: 'cartodb',
  sublayers: [{
    sql: '',
    cartocss,
    interactivity: routeSegmentsFieldsVisible.join(',')
  }]
};

// enables the SQL to be changed for the Carto(db).JS layer source object
export const configureLayerSource = (sql) => {
  cartoLayerSource.sublayers[0].sql = sql;
  return cartoLayerSource;
};

// CARTO SQL API endpoint
export const cartoSQLQuery = query =>
  `https://${cartoUser}.carto.com/api/v2/sql?q=${query}`;

// Asyncronously loads the code for geo routing
export const loadGeoRouter = callback =>
  import('../../lib/ecgClientRouter')
    .then(response => callback(null, response))
    .catch(error => callback(error));

// async loads togpx.js
export const loadToGPX = callback =>
  import('togpx')
    .then(response => callback(null, response))
    .catch(error => callback(error));

// async loads file-saver.js
export const loadFileSaver = callback =>
  import('file-saver')
    .then(response => callback(null, response))
    .catch(error => callback(error));

// async loads turf/distance and turf/midpoint
export const loadTurfModules = callback =>
  Promise.all([
    import('@turf/distance'),
    import('@turf/midpoint'),
  ])
  .then(response => callback(null, response))
  .catch(error => callback(error));

// helper function to convert meters to miles
export const metersToMiles = x => +parseFloat(x * 0.000621371).toFixed(2);
