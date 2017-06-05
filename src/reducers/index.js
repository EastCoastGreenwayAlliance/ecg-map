import { combineReducers } from 'redux';
import { createResponsiveStateReducer } from 'redux-responsive';

import geocodeReducer from './geocodeReducer';
import routingReducer from './ecgRoutingReducer';

// breakpoints to match Skeleton CSS's
const browser = createResponsiveStateReducer({
  extraSmall: 420,
  small: 550,
  medium: 750,
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
  geocoding: geocodeReducer,
  routing: routingReducer,
});

export default rootReducer;
