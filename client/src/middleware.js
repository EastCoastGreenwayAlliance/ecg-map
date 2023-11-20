import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';

import {
  ROUTE_SEARCH_ERROR,
  LOCATION_GEOCODE_ERROR,
  ROUTING_LOCATION_ERROR,
  ELEVATION_DATA_ERROR,
  ACTIVE_TURNING_ERROR
} from './common/actionTypes';

import {
  logGeocodeError,
  logRouteLocationError,
  logElevDataRequestError,
  logActiveTurningError,
  logRouteSearchError,
} from './common/googleAnalytics';

const middleware = [thunkMiddleware];

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // redux-logger only works in a browser environment
  middleware.push(logger);
}

// handles logging application errors to Google Analytics
const errorGaReporter = store => next => (action) => {
  switch (action.type) {
    case LOCATION_GEOCODE_ERROR:
      logGeocodeError(action.error, store);
      return next(action);

    case ROUTING_LOCATION_ERROR:
      logRouteLocationError(action.error);
      return next(action);

    case ELEVATION_DATA_ERROR:
      logElevDataRequestError(action.error);
      return next(action);

    case ACTIVE_TURNING_ERROR:
      logActiveTurningError(action.error);
      return next(action);

    case ROUTE_SEARCH_ERROR:
      // NOTE: don't care about the error message for this one
      logRouteSearchError();
      return next(action);

    default:
      return next(action);
  }
};

middleware.push(errorGaReporter);

export default middleware;
