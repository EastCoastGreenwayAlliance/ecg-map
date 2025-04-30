// Asyncronous Action Creators to handle geocode requests
// Used with Redux Thunk, see: http://redux.js.org/docs/advanced/AsyncActions.html
import fetch from 'isomorphic-fetch';

// import { googleAPIKey } from '../common/config';

import {
  LOCATION_GEOCODE_REQUEST,
  LOCATION_GEOCODE_SUCCESS,
  LOCATION_GEOCODE_ERROR,
  LOCATION_GEOCODE_CLEAR,
  LOCATION_GEOCODE_ZOOMMAP_ENABLE,
  LOCATION_GEOCODE_ZOOMMAP_DISABLE,
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

// toggle the zoom-to map behavior when a geocode is done
// disabling is useful e.g. when dragging a marker to change one end
// when zooming in to the points is disturbing UX
export const setMapZoomOnGeocode = trueorfalse => ({
  type: trueorfalse ? LOCATION_GEOCODE_ZOOMMAP_ENABLE : LOCATION_GEOCODE_ZOOMMAP_DISABLE,
});

/*
 * Redux Thunk action creator to fetch geocoded JSON for a given location / address
 * @param {string} location: A URI encoded string representing an address,
 *   e.g. "1600+Amphitheatre+Parkway,+Mountain+View,+CA"
 * This also handles reverse geocodes, to fetch the address at the point...
 * though this is not really used anymore, so the reverse geocode is wasted,
 * but caller expects a fetch() and refactoring would be a big deal.
*/
const fetchLocationGeocode = (searchTerm, addressislatlngcoords = false) => {
  if (addressislatlngcoords) {
    const [lat, lng] = searchTerm.split(',');
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=geojson`;

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
          const { features } = json;
          if (!features || !features.length) {
            dispatch(locationGeocodeError('Address not found, please try again.'));
            return;
          }

          const theresult = {
            address_components: [],  // unused, legacy
            formatted_address: searchTerm,  // their own words, don't use geocoder's name anymore
            geometry: {  // emulate Google Maps API format
              location_type: 'ROOFTOP',
              location: {
                lng: features[0].geometry.coordinates[0],
                lat: features[0].geometry.coordinates[1],
              },
            },
          };

          dispatch(locationGeocodeSuccess(theresult));
        })
        .catch(error => dispatch(locationGeocodeError(error)));
    };
  }

  // not a reverse geocode, but an address geocode
  // can't wrap this in a nice, readable "else" because of the linter
  const viewbox = '-90.175781,24.046464,-58.666992,48.224673';
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&bounded=1&viewbox=${viewbox}&limit=1&q=${encodeURIComponent(searchTerm)}`;

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
      .then((features) => {
        if (!features || !features.length) {
          dispatch(locationGeocodeError('Address not found, please try again.'));
          return;
        }

        const theresult = {
          address_components: [],  // unused, legacy
          formatted_address: searchTerm,  // their own words, don't use geocoder's name anymore
          geometry: {  // emulate Google Maps API format
            location_type: 'ROOFTOP',
            location: {
              lng: parseFloat(features[0].lon),
              lat: parseFloat(features[0].lat),
            },
          },
        };

        dispatch(locationGeocodeSuccess(theresult));
      })
      .catch(error => dispatch(locationGeocodeError(error)));
  };
};

export default fetchLocationGeocode;
