import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import ReactGA from 'react-ga/src/index'; // have to import from the src path

import {
  ROUTE_SEARCH_ERROR,
  LOCATION_GEOCODE_ERROR,
  ROUTING_LOCATION_ERROR,
  MAILCHIMP_POST_ERROR,
  ELEVATION_DATA_ERROR,
  ACTIVE_TURNING_ERROR
} from './common/actionTypes';

const middleware = [thunkMiddleware];

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // redux-logger only works in a browser environment
  middleware.push(logger);
}

// handles logging application errors to Google Analytics
const errorGaReporter = store => next => (action) => {
  switch (action.type) {
    case LOCATION_GEOCODE_ERROR:
      ReactGA.event({
        category: 'App Errors',
        action: 'Geocode Error',
        label: (action.error.message || action.error) +
          store.getState().geocoding.searchTerm
      });
      return next(action);

    case ROUTING_LOCATION_ERROR:
      ReactGA.event({
        category: 'App Errors',
        action: 'Location Search Error',
        label: action.error.message || action.error
      });
      return next(action);

    case MAILCHIMP_POST_ERROR:
      ReactGA.event({
        category: 'App Errors',
        action: 'Mailchimp signup error',
        label: action.error.message || action.error
      });
      return next(action);

    case ELEVATION_DATA_ERROR:
      ReactGA.event({
        category: 'App Errors',
        action: 'Elevation Data Request Error',
        label: action.error.message || action.error
      });
      return next(action);

    case ACTIVE_TURNING_ERROR:
      ReactGA.event({
        category: 'App Errors',
        action: 'Active Turning Error',
        label: action.error.message || action.error
      });
      return next(action);

    case ROUTE_SEARCH_ERROR:
      ReactGA.event({
        category: 'App Errors',
        action: 'Route Search Error',
        label: window.location.search
      });
      return next(action);

    default:
      return next(action);
  }
};

middleware.push(errorGaReporter);

export default middleware;
