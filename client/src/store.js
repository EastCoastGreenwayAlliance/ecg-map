import { applyMiddleware, createStore, compose } from 'redux';
import { responsiveStoreEnhancer, calculateResponsiveState } from 'redux-responsive';
import debounce from 'lodash/debounce';

import rootReducer from './reducers/';
import middleware from './middleware';

// saved sample application state for store.routing, for testing / feature development,
// so that we don't have to manually go through the UX steps to get routing data
// be sure to remove this when app is ready for production!
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

const store = makeStore({ routing: routingState });
// const store = makeStore({});

// fire redux-responsive on window resize event
window.addEventListener('resize', debounce(() =>
  store.dispatch(calculateResponsiveState(window)), 150));

export default store;
