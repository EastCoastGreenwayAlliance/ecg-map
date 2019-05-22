// Redux Reducer to store app state relating to geocode requests
import {
  POI_SELECT,
  POI_DESELECT,
  POIS_NEARBY_UPDATE,
} from '../common/actionTypes';

const defaultState = {
  selected: null,
  nearby: [],
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

    case POIS_NEARBY_UPDATE:
      return {
        ...state,
        nearby: action.nearby,
      };

    default:
      return state;
  }
};
