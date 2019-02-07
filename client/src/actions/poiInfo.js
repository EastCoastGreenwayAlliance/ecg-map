import {
  POI_SELECT,
  POI_CLEAR,
  POIS_NEARBY_UPDATE,
} from '../common/actionTypes';

const poiSelect = poi => ({
  type: POI_SELECT,
  poi
});

const poiDeselect = () => ({
  type: POI_CLEAR,
});

const nearbyPois = poilist => ({
  type: POIS_NEARBY_UPDATE,
  nearby: poilist,
});

// the wrapper to select a Alert Point or to select none (de-select current)
export const selectPoi = poi => (dispatch) => {
  const event = poi ? poiSelect(poi) : poiDeselect();
  dispatch(event);
};

export const updateNearbyPois = poilist => (dispatch) => {
  const event = nearbyPois(poilist);
  dispatch(event);
};
