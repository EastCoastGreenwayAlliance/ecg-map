import { cartoUser, routeSegmentsFieldsVisible } from './config';
import cartocss from '../common/cartocss';

const noop = () => ({});

const isNumber = val => val && typeof val === 'number';

export const parseURLHash = () => {
  // parses the URL hash to see if it contains zxy settings for the leaflet map
  // used to set the map's center and zoom on load
  const hash = window.location.hash;
  if (!hash.length) return noop();

  const split = hash.split('#')[1];
  if (!split) return noop();

  const zxy = split.split('/');
  if (!zxy.length || zxy.length < 3 || zxy.length > 3) return noop();

  return {
    zoom: isNumber(+zxy[0]) ? +zxy[0] : null,
    lat: isNumber(+zxy[1]) ? +zxy[1] : null,
    lng: isNumber(+zxy[2]) ? +zxy[2] : null,
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

export const configureLayerSource = (sql) => {
  cartoLayerSource.sublayers[0].sql = sql;
  return cartoLayerSource;
};

// CARTO SQL API endpoint
export const cartoSQLQuery = query =>
  `https://${cartoUser}.carto.com/api/v2/sql?q=${query}`;
