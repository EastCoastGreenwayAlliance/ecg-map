import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import ReactGA from 'react-ga/src/index'; // have to import from the src path

import { ROUTE_SEARCH_ERROR } from './common/actionTypes';

const middleware = [thunkMiddleware];

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // redux-logger only works in a browser environment
  middleware.push(logger);
}

const noRouteFoundReporter = () => next => (action) => {
  if (action.type === ROUTE_SEARCH_ERROR) {
    // log the route search error with current query params
    ReactGA.event({
      category: 'App Errors',
      action: 'Route Search Error',
      label: window.location.search
    });

    return next(action);
  }

  return next(action);
};

middleware.push(noRouteFoundReporter);

export default middleware;
