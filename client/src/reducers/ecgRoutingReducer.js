// Redux Reducer that handles geographic routing / directions for the ECG
import {
  ACCEPT_ROUTING_LOCATION,
  SET_ROUTING_LOCATION,
  CANCEL_ROUTING_LOCATION,
  ROUTING_LOCATION_ERROR,
  ROUTE_SEARCH_REQUEST,
  ROUTE_SEARCH_SUCCESS,
  ROUTE_SEARCH_ERROR,
} from '../common/actionTypes';

const defaultState = {
  startLocation: {
    accepted: false,
    coordinates: [],
    distance: null,
    error: null,
    positionText: 'start',
  },
  endLocation: {
    accepted: false,
    coordinates: [],
    distance: null,
    error: null,
    positionText: 'end'
  },
  route: {
    isLoadingRoute: false,
    response: null,
    error: null,
  }
};

/*
 * Routing Reducer
 * @param {object} state: default reducer state
 * @param {object} action: redux action creator
*/
export default (state = defaultState, action) => {
  switch (action.type) {

    case SET_ROUTING_LOCATION:
      if (action.step === 'START') {
        return {
          ...state,
          startLocation: {
            ...state.startLocation,
            coordinates: action.coords,
            distance: action.distance,
          }
        };
      }

      if (action.step === 'END') {
        return {
          ...state,
          endLocation: {
            ...state.endLocation,
            coordinates: action.coords,
            distance: action.distance,
          }
        };
      }

      break;

    case ACCEPT_ROUTING_LOCATION:
      if (action.step === 'START') {
        return {
          ...state,
          startLocation: {
            ...state.startLocation,
            accepted: true,
          }
        };
      }

      if (action.step === 'END') {
        return {
          ...state,
          endLocation: {
            ...state.endLocation,
            accepted: true,
          }
        };
      }

      break;

    case CANCEL_ROUTING_LOCATION:
      if (action.step === 'START') {
        return {
          ...state,
          startLocation: {
            accepted: false,
            coordinates: [],
            placeName: '',
          }
        };
      }

      if (action.step === 'END') {
        return {
          ...state,
          endLocation: {
            accepted: false,
            coordinates: [],
            placeName: '',
          }
        };
      }

      break;

    case ROUTING_LOCATION_ERROR:
      if (action.step === 'START') {
        return {
          ...state,
          startLocation: {
            ...state.startLocation,
            error: action.error
          }
        };
      }

      if (action.step === 'END') {
        return {
          ...state,
          endLocation: {
            ...state.endLocation,
            error: action.error
          }
        };
      }

      break;

    case ROUTE_SEARCH_REQUEST:
      return {
        ...state,
        route: {
          isLoadingRoute: true,
          ...state.route,
        }
      };

    case ROUTE_SEARCH_SUCCESS:
      return {
        ...state,
        route: {
          isLoadingRoute: false,
          response: action.response,
          ...state.route
        }
      };

    case ROUTE_SEARCH_ERROR:
      return {
        ...state,
        route: {
          isLoadingRoute: false,
          error: action.error
        }
      };

    default:
      return state;
  }
};
