// Redux Reducer that handles making a request to the Google Geocoder API
import {
  LOCATION_GEOCODE_REQUEST,
  LOCATION_GEOCODE_SUCESS,
  LOCATION_GEOCODE_ERROR
} from '../common/actionTypes';

const defaultState = {
  fetchingLocationGeocode: false,
  result: null,
  error: null
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case LOCATION_GEOCODE_REQUEST:
      return {
        ...state,
        fetchingLocationGeocode: true,
      };

    case LOCATION_GEOCODE_SUCESS:
      return {
        ...state,
        fetchingLocationGeocode: false,
        result: action.json
      };

    case LOCATION_GEOCODE_ERROR:
      return {
        ...state,
        fetchingLocationGeocode: false,
        error: action.error
      };

    default:
      return state;
  }
};
