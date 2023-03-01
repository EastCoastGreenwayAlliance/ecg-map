// Asyncronous Action Creators to handle geocode requests
// Used with Redux Thunk, see: http://redux.js.org/docs/advanced/AsyncActions.html
import fetch from 'isomorphic-fetch';

import { googleAPIKey } from '../common/config';

import {
  LOCATION_GEOCODE_REQUEST,
  LOCATION_GEOCODE_SUCCESS,
  LOCATION_GEOCODE_ERROR,
  LOCATION_GEOCODE_CLEAR,
} from '../common/actionTypes';

// we are about to make a GET request to geocode a location
const locationGeocodeRequest = searchTerm => ({
  type: LOCATION_GEOCODE_REQUEST,
  searchTerm
});

// we have JSON data representing the geocoded location
const locationGeocodeSuccess = json => ({
  type: LOCATION_GEOCODE_SUCCESS,
  json
});

// we encountered an error geocoding the location
export const locationGeocodeError = error => ({
  type: LOCATION_GEOCODE_ERROR,
  error
});

// user canceled the geo routing search process, reset the geocode state
export const locationGeocodeClear = () => ({
  type: LOCATION_GEOCODE_CLEAR,
});

/*
 * Redux Thunk action creator to fetch geocoded JSON for a given location / address
 * @param {string} location: A URI encoded string representing an address,
 *   e.g. "1600+Amphitheatre+Parkway,+Mountain+View,+CA"
*/
const fetchLocationGeocode = (searchTerm, addressislatlngcoords = false) => {
  const searchTermEncoded = encodeURIComponent(searchTerm);
  const viewportBias = encodeURIComponent('24.046464,-90.175781|48.224673,-58.666992');
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchTermEncoded}&bounds=${viewportBias}&key=${googleAPIKey}`;

  return (dispatch) => {
    dispatch(locationGeocodeRequest(searchTerm));

    return fetch(url)
      .then((res) => {
        if (!res.ok) {
          dispatch(locationGeocodeError(res.statusText));
          throw Error(res.statusText);
        } else {
          return res.json();
        }
      })
      .then((json) => {
        const { results, status } = json;
        // catch a non-successful geocode result that was returned in the response
        if (!results || !results.length || status !== 'OK') {
          dispatch(locationGeocodeError('Address not found, please try again.'));
        } else {
          // if addressislatlngcoords then fudge the result to be the point we asked for
          // why did we geocode at all? caller expects a fetch()
          const theresult = results[0];

          if (addressislatlngcoords) {
            const lat = parseFloat(searchTerm.trim().split(',')[0]);
            const lng = parseFloat(searchTerm.trim().split(',')[1]);
            theresult.address_components = [];
            theresult.formatted_address = searchTerm;
            theresult.geometry.location_type = 'ROOFTOP';
            theresult.geometry.location.lng = lng;
            theresult.geometry.location.lat = lat;
          }

          dispatch(locationGeocodeSuccess(theresult));
        }
      })
      .catch(error => dispatch(locationGeocodeError(error)));
  };
};

export default fetchLocationGeocode;
