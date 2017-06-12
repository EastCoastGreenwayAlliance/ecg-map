// Redux Action Creators for ECG Routing / Directions
import {
  ACCEPT_ROUTING_LOCATION,
  SET_ROUTING_LOCATION,
  CANCEL_ROUTING_LOCATION,
  ROUTING_LOCATION_ERROR,
} from '../common/actionTypes';

export const nearestSegmentError = error => ({
  ROUTING_LOCATION_ERROR,
  error
});

// app displays current routing location
// @param { array } coords: lat, lng for start location
// @param { string } step: either START or END
export const setRoutingLocation = (coords, step) => ({
  type: SET_ROUTING_LOCATION,
  coords,
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
