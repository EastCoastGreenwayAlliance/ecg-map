// Redux Action Creators for ECG Routing / Directions
import {
  ACCEPT_ROUTING_LOCATION,
  SET_ROUTING_LOCATION,
  CANCEL_ROUTING_LOCATION,
  ROUTING_LOCATION_ERROR,
  ROUTE_SEARCH_REQUEST,
  ROUTE_SEARCH_SUCCESS,
  ROUTE_SEARCH_ERROR,
} from '../common/actionTypes';


export const nearestSegmentError = error => ({
  ROUTING_LOCATION_ERROR,
  error
});

// app displays current routing location
// @param { array } coords: lat, lng for start location
// @param { string } step: either START or END
export const setRoutingLocation = (coords, distance, step) => ({
  type: SET_ROUTING_LOCATION,
  coords,
  distance,
  step,
});

// user accepts the current routing location
// @param { string } step: either START or END
export const acceptRoutingLocation = step => ({
  type: ACCEPT_ROUTING_LOCATION,
  step
});

// user cancels the current routing location
// @param { string } step: either START or END
export const cancelRoutingLocation = step => ({
  type: CANCEL_ROUTING_LOCATION,
  step,
});

// actions for describing the route search
// happens after a user confirms their start and end locations
// note these are async actions not handled directly by the app / redux thunk,
// but are handled by the ecgClientRouter module instead
// 1. route search was requested, let our app know so we can show a loading GIF
export const routeSearchRequest = () => ({
  type: ROUTE_SEARCH_REQUEST,
});

// 2. route search was successful, pass along the response
// @param { object } response: response returned from ecgClientRouter.findRoute
export const routeSearchSuccess = response => ({
  type: ROUTE_SEARCH_SUCCESS,
  response,
});

// 3. route search errored, pass along the error so it may be handled
// @param { object } error: error returned from ecgClientRouter.findRoute
export const routeSearchError = error => ({
  type: ROUTE_SEARCH_ERROR,
  error,
});
