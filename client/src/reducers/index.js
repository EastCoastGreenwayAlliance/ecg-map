// Redux Reducers, for more info on Reducers see: http://redux.js.org/docs/basics/Reducers.html
import { combineReducers } from 'redux';
import { createResponsiveStateReducer } from 'redux-responsive';

import mailchimpReducer from './mailchimpReducer';
import geocodeReducer from './geocodeReducer';
import routingReducer from './ecgRoutingReducer';
import elevationReducer from './elevationDataReducer';
import activeTurningReducer from './activeTurningReducer';
import poiReducer from './poiReducer';

// breakpoints to match Skeleton CSS's
const browser = createResponsiveStateReducer({
  extraSmall: 420,
  small: 550,
  medium: 768,
  large: 1000,
  extraLarge: 1200
}, {
  extraFields: () => ({
    width: window.innerWidth,
    height: window.innerHeight
  })
});

const rootReducer = combineReducers({
  browser,
  elevation: elevationReducer,
  geocoding: geocodeReducer,
  mailchimp: mailchimpReducer,
  routing: routingReducer,
  activeturning: activeTurningReducer,
  pois: poiReducer,
});

export default rootReducer;
export { defaultRoutingState } from './ecgRoutingReducer';
