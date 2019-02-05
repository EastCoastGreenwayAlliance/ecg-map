// Redux Reducer to store app state relating to geocode requests
import {
  ALERTPOI_SELECT,
  ALERTPOI_CLEAR,
} from '../common/actionTypes';

const defaultState = {
  poi: null,
};

/*
 * Alert POI Reducer
 * @param {object} state: default reducer state
 * @param {object} action: redux action creator
*/
export default (state = defaultState, action) => {
  switch (action.type) {
    case ALERTPOI_SELECT:
      return {
        ...state,
        poi: action.poi,
      };

    case ALERTPOI_CLEAR:
      return { ...defaultState };

    default:
      return state;
  }
};
