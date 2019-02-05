import {
  ALERTPOI_SELECT,
  ALERTPOI_CLEAR,
} from '../common/actionTypes';

const alertPointSelect = poi => ({
  type: ALERTPOI_SELECT,
  poi
});

const alertPointDeselect = () => ({
  type: ALERTPOI_CLEAR,
});

// the wrapper to select a Alert Point or to select none (de-select current)
const selectAlertPoint = poi => (dispatch) => {
  const event = poi ? alertPointSelect(poi) : alertPointDeselect();
  dispatch(event);
};

export default selectAlertPoint;
