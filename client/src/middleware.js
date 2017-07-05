import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';

import { CANCEL_ROUTING_LOCATION } from './common/actionTypes';
import { locationGeocodeClear, elevationDataClear } from './actions';

const middleware = [thunkMiddleware];

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // redux-logger only works in a browser environment
  middleware.push(logger);
}

// Custom Redux Middleware that allows for intercepting the CANCEL_ROUTING_LOCATION
// action and dispatch other actions so that we can reset related parts of application state
const cancelRoutingMiddleware = ({ dispatch }) => next => (action) => {
  let result;

  if (action.type === CANCEL_ROUTING_LOCATION) {
    // clear any geocode information we currently have
    dispatch(locationGeocodeClear());
    // clear any elevation data results we might have
    dispatch(elevationDataClear());
    result = next(action);
    return result;
  }

  return next(action);
};

middleware.push(cancelRoutingMiddleware);

export default middleware;
