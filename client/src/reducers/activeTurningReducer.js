// Redux Reducer that stores app state relating to geographic routing for the ECG
import {
  ACTIVE_TURNING_UPDATE,
  ACTIVE_TURNING_ENABLE,
  ACTIVE_TURNING_DISABLE,
  ACTIVE_TURNING_ERROR,
} from '../common/actionTypes';

const defaultState = {
  enabled: false, // is the active turning feature enabled?
  onpath: false,  // are we on the path? false = off the route
  currentplace: '',  // text name of our current line segment location
  distance: '', // distance to the next turn
  transition_code: '',  // code for the next turning direction, see ecg-map-route docs
  transition_text: '',  // text for next turning direction, see ecg-map-route docs
  error: null, // error message from Leaflet locationerror event
};


/*
 * Routing Reducer
 * @param {object} state: default reducer state
 * @param {object} action: redux action creator
*/
export default (state = defaultState, action) => {
  // for now we only foresee one type of action... but let's leave the door open for more
  switch (action.type) {

    case ACTIVE_TURNING_UPDATE:
      return {
        ...state,
        onpath: action.onpath,
        currentplace: action.currentplace,
        distance: action.distance,
        transition_code: action.transition_code,
        transition_text: action.transition_text,
      };

    case ACTIVE_TURNING_ENABLE:
      return {
        ...state,
        enabled: true
      };

    case ACTIVE_TURNING_DISABLE:
      return {
        ...defaultState,
        enabled: false
      };

    case ACTIVE_TURNING_ERROR:
      return {
        ...state,
        error: action.error
      };

    default:
      return state;
  }
};
