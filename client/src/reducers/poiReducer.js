// Redux Reducer to store app state relating to geocode requests
import {
  POI_SELECT,
  POI_CLEAR,
} from '../common/actionTypes';

const defaultState = {
  poi: null,
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
        poi: action.poi,
      };

    case POI_CLEAR:
      return { ...defaultState };

    default:
      return state;
  }
};
