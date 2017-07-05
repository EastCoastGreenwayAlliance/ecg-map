// Redux Reducer that stores app state relating to geographic routing for the ECG
import {
  REQUEST_ROUTING_LOCATION,
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
    isFetching: false,
    positionText: 'start',
  },
  endLocation: {
    accepted: false,
    coordinates: [],
    distance: null,
    error: null,
    isFetching: false,
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

    case REQUEST_ROUTING_LOCATION:
      if (action.step === 'START') {
        return {
          ...state,
          startLocation: {
            ...state.startLocation,
            isFetching: true,
          }
        };
      }

      if (action.step === 'END') {
        return {
          ...state,
          endLocation: {
            ...state.endLocation,
            isFetching: true,
          }
        };
      }

      break;

    case SET_ROUTING_LOCATION:
      if (action.step === 'START') {
        return {
          ...state,
          startLocation: {
            ...state.startLocation,
            coordinates: action.coords,
            distance: action.distance,
            isFetching: false,
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
            isFetching: false,
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
            isFetching: false,
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
            isFetching: false,
          }
        };
      }

      // user chooses to start over
      if (action.step === 'DONE') {
        return { ...defaultState };
      }

      break;

    case ROUTING_LOCATION_ERROR:
      if (action.step === 'START') {
        return {
          ...state,
          startLocation: {
            ...state.startLocation,
            error: action.error,
            isFetching: false,
          }
        };
      }

      if (action.step === 'END') {
        return {
          ...state,
          endLocation: {
            ...state.endLocation,
            error: action.error,
            isFetching: false,
          },
          route: {
            isLoadingRoute: false,
            response: null,
            error: null,
          }
        };
      }

      break;

    case ROUTE_SEARCH_REQUEST:
      return {
        ...state,
        route: {
          ...state.route,
          isLoadingRoute: true,
        }
      };

    case ROUTE_SEARCH_SUCCESS:
      return {
        ...state,
        route: {
          ...state.route,
          isLoadingRoute: false,
          response: action.response,
        }
      };

    case ROUTE_SEARCH_ERROR:
      return {
        ...state,
        route: {
          ...state.route,
          isLoadingRoute: false,
          error: action.error,
        }
      };

    default:
      return state;
  }
};
