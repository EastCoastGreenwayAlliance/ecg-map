// Redux Actions, for more info see: http://redux.js.org/docs/basics/Actions.html
export fetchLocationGeocode, { locationGeocodeError } from './geocodeActions';
export {
  nearestSegmentRequest,
  nearestSegmentError,
  setRoutingLocation,
  acceptRoutingLocation,
  cancelRoutingLocation,
  routeSearchRequest,
  routeSearchSuccess,
  routeSearchError,
} from './ecgRoutingActions';
export postMailchimpAPI from './mailchimpActions';
export fetchElevationData, { elevationDataClear } from './elevationDataActions';
export {
  enableActiveTurning,
  disableActiveTurning,
  updateActiveTurning
} from './activeTurningActions';
