// Redux Reducer to store app state relating to geocode requests
import {
  POI_SELECT,
  POI_DESELECT,
} from '../common/actionTypes';

const defaultState = {
  selected: null,
};

/*
 * POI Reducer
 * @param {object} state: default reducer state
 * @param {object} action: redux action creator
*/
export default (state = defaultState, action) => {
  switch (action.type) {
    case POI_SELECT:
      return {
        ...state,
        selected: action.poi,
      };

    case POI_DESELECT:
      return {
        ...state,
        selected: null,
      };

    default:
      return state;
  }
};
