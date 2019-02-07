import {
  POI_SELECT,
  POI_CLEAR,
} from '../common/actionTypes';

const poiSelect = poi => ({
  type: POI_SELECT,
  poi
});

const poiDeselect = () => ({
  type: POI_CLEAR,
});

// the wrapper to select a Alert Point or to select none (de-select current)
const selectPoi = poi => (dispatch) => {
  const event = poi ? poiSelect(poi) : poiDeselect();
  dispatch(event);
};

export default selectPoi;
