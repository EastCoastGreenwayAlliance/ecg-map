// Asyncronous Action Creators using Redux Thunk, see: http://redux.js.org/docs/advanced/AsyncActions.html
import fetch from 'isomorphic-fetch';

import { googleAPIKey } from '../common/config';

import {
  LOCATION_GEOCODE_REQUEST,
  LOCATION_GEOCODE_SUCESS,
  LOCATION_GEOCODE_ERROR,
} from '../common/actionTypes';

// we are about to make a GET request to geocode a location
const locationGeocodeRequest = () => ({
  type: LOCATION_GEOCODE_REQUEST,
});

// we have JSON data representing the geocoded location
const locationGeocodeSuccess = json => ({
  type: LOCATION_GEOCODE_SUCESS,
  json
});

// we encountered an error geocoding the location
const locationGeocodeError = error => ({
  type: LOCATION_GEOCODE_ERROR,
  error
});

/*
 * Redux Thunk action creator to fetch geocoded JSON for a given location / address
 * @param {string} location: A URI encoded string representing an address,
 *   e.g. "1600+Amphitheatre+Parkway,+Mountain+View,+CA"
*/
const fetchLocationGeocode = (location) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${googleAPIKey}`;

  return (dispatch) => {
    dispatch(locationGeocodeRequest());
    return fetch(url)
      .then(res => res.json())
      .then(json => dispatch(locationGeocodeSuccess(json)))
      .catch(error => dispatch(locationGeocodeError(error)));
  };
};

export default fetchLocationGeocode;
