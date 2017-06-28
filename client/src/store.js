import { applyMiddleware, createStore, compose } from 'redux';
import { responsiveStoreEnhancer, calculateResponsiveState } from 'redux-responsive';
import debounce from 'lodash/debounce';

import rootReducer from './reducers/';
import middleware from './middleware';

// saved sample application state for store.routing, for testing / feature development,
// so that we don't have to manually go through the UX steps to get routing data
import routingState from './hydratedStateForTesting.json';

function makeStore(initialState) {
  const store = createStore(
    rootReducer,
    initialState,
    compose(
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

const preloadedState = process.env.NODE_ENV === 'production' ? {} : { routing: routingState };
const store = makeStore(preloadedState);

// fire redux-responsive on window resize event
window.addEventListener('resize', debounce(() =>
  store.dispatch(calculateResponsiveState(window)), 150));

export default store;
