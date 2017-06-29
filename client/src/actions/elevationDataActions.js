// Redux action creators for elevation data request
// Used with Redux Thunk, see: http://redux.js.org/docs/advanced/AsyncActions.html
// google-maps npm package is an async wrapper around the google maps library
import GoogleMapsLoader from 'google-maps';

import { googleAPIKey } from '../common/config';
import {
  ELEVATION_DATA_REQUEST,
  ELEVATION_DATA_SUCCESS,
  ELEVATION_DATA_ERROR,
  ELEVATION_DATA_CLEAR,
} from '../common/actionTypes';

// set our API Key
GoogleMapsLoader.KEY = googleAPIKey;

const elevationDataRequest = () => ({
  type: ELEVATION_DATA_REQUEST
});

const elevationDataSuccess = json => ({
  type: ELEVATION_DATA_SUCCESS,
  json
});

const elevationDataError = error => ({
  type: ELEVATION_DATA_ERROR,
  error
});

// in the case of starting the search over, clear the existing elevation data
export const elevationDataClear = () => ({
  type: ELEVATION_DATA_CLEAR,
});


/*
 * Fetch Elevation Data
 * Makes an API request for elevation data for a given portion of the ECG route
 * @param {array} coordinates: an array of objects containing lat lon coordinate pairs
*/
const fetchElevationData = path => (dispatch) => {
  dispatch(elevationDataRequest());

  GoogleMapsLoader.load((google) => {
    let elev;
    /* eslint-disable */
    elev = new google.maps.ElevationService;
    /* eslint-enable */

    elev.getElevationAlongPath({
      path,
      samples: path.length
    }, (elevPoints, status) => {
      if (!elevPoints || !elevPoints.length || !status === 'OK') {
        dispatch(elevationDataError(`could not GET elevation data, status: ${status}`));
      } else {
        dispatch(elevationDataSuccess(elevPoints));
      }
    });
  });
};

export default fetchElevationData;
