// Redux Reducer to store app state relating to geocode requests
import {
  LOCATION_GEOCODE_REQUEST,
  LOCATION_GEOCODE_SUCCESS,
  LOCATION_GEOCODE_ERROR,
  LOCATION_GEOCODE_CLEAR,
  LOCATION_GEOCODE_ZOOMMAP_ENABLE,
  LOCATION_GEOCODE_ZOOMMAP_DISABLE,
} from '../common/actionTypes';

const defaultState = {
  isFetching: false,
  searchTerm: '',
  result: null,
  error: null,
  zoomMapToGeocodes: true,
};

const parseGeocodeResult = (result) => {
  const { formatted_address, geometry } = result;
  const addressLabel = formatted_address.replace(/,\s+(USA|Canada|Mexico)\s*$/, '');

  return {
    addressFormatted: addressLabel,
    coordinates: [geometry.location.lat, geometry.location.lng],
  };
};

/*
 * Geocoding Reducer
 * @param {object} state: default reducer state
 * @param {object} action: redux action creator
*/
export default (state = defaultState, action) => {
  switch (action.type) {
    case LOCATION_GEOCODE_REQUEST:
      return {
        ...state,
        isFetching: true,
        searchTerm: action.searchTerm,
        result: null
      };

    case LOCATION_GEOCODE_SUCCESS:
      return {
        ...state,
        error: null,
        isFetching: false,
        result: parseGeocodeResult(action.json)
      };

    case LOCATION_GEOCODE_ERROR:
      return {
        ...state,
        isFetching: false,
        error: action.error
      };

    case LOCATION_GEOCODE_CLEAR:
      return { ...defaultState };

    case LOCATION_GEOCODE_ZOOMMAP_ENABLE:
      return {
        ...state,
        zoomMapToGeocodes: true,
      };

    case LOCATION_GEOCODE_ZOOMMAP_DISABLE:
      return {
        ...state,
        zoomMapToGeocodes: false,
      };

    default:
      return state;
  }
};
