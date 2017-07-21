import { applyMiddleware, createStore, compose } from 'redux';
import { responsiveStoreEnhancer, calculateResponsiveState } from 'redux-responsive';
import debounce from 'lodash/debounce';

import rootReducer from './reducers/';
import middleware from './middleware';
import { preloadRoutingState } from './common/api';

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
    // Enable Webpack's "hot module replacement" for Redux reducers
    module.hot.accept('./reducers', () => {
      const nextReducer = System.import('./reducers/index.js').default;
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}

// create the preloaded state for store.routing if any query params exist
const preloadedState = {
  routing: preloadRoutingState(),
};

// set our default application state
const store = makeStore(preloadedState);

// fire redux-responsive on window resize event
window.addEventListener('resize', debounce(() =>
  store.dispatch(calculateResponsiveState(window)), 150));

export default store;
