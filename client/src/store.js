import { applyMiddleware, createStore, compose } from 'redux';
import { responsiveStoreEnhancer, calculateResponsiveState } from 'redux-responsive';
import debounce from 'lodash/debounce';

import rootReducer from './reducers/';
import middleware from './middleware';
import { parseURLQueryParams, preloadRoutingState } from './common/api';

// saved sample application state for store.routing, for testing / feature development,
// so that we don't have to manually go through the UX steps to get routing data
// import routingState from './hydratedStateForTesting.json';

// enable redux dev tools: https://github.com/zalmoxisus/redux-devtools-extension
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

function makeStore(initialState) {
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(
      responsiveStoreEnhancer,
      applyMiddleware(...middleware)
    )
  );

  if (module.hot) {
    // enable hot module replacement
    module.hot.accept('./reducers', () => {
      const nextReducer = System.import('./reducers/index.js').default;
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}

// temp state for testing app after a route has been successfully searched & loaded
// const preloadedState = process.env.NODE_ENV === 'production' ? {} : { routing: routingState };

// look for start and end lat lons in the query params
const startEnd = parseURLQueryParams();
// create the preloaded state for store.routing if any query params exist
const preloadedState = {
  routing: preloadRoutingState(startEnd),
};
// set our default application state
const store = makeStore(preloadedState);

// fire redux-responsive on window resize event
window.addEventListener('resize', debounce(() =>
  store.dispatch(calculateResponsiveState(window)), 150));

export default store;
