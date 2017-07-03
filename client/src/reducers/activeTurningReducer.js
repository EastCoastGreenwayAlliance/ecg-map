// Redux Reducer that stores app state relating to geographic routing for the ECG
import {
  ACTIVETURNING_UPDATE,
} from '../common/actionTypes';

const defaultState = {
  onpath: false,  // are we on the path? false = off the route
  currentplace: '',  // text name of our current line segment location
  distance: '', // distance to the next turn
  transition_code: '',  // code for the next turning direction, see ecg-map-route docs
  transition_text: '',  // text for next turning direction, see ecg-map-route docs
};


/*
 * Routing Reducer
 * @param {object} state: default reducer state
 * @param {object} action: redux action creator
*/
export default (state = defaultState, action) => {
  // for now we only foresee one type of action... but let's leave the door open for more
  switch (action.type) {

    case ACTIVETURNING_UPDATE:
      return {
        ...state,
        onpath: action.onpath,
        currentplace: action.currentplace,
        distance: action.distance,
        transition_code: action.transition_code,
        transition_text: action.transition_text,
      };

    default:
      return state;
  }
};
