import { applyMiddleware, createStore, compose } from 'redux';
import { responsiveStoreEnhancer, calculateResponsiveState } from 'redux-responsive';
import debounce from 'lodash/debounce';

import rootReducer from './reducers/';
import middleware from './middleware';

function makeStore(initialState) {
  const store = createStore(
    rootReducer,
    initialState,
    compose(
      responsiveStoreEnhancer, // throttle time
      applyMiddleware(...middleware)
    )
  );

  if (module.hot) {
    // enable hot module replacement
    module.hot.accept('./reducers/index.js', () => {
      const nextReducer = System.import('./reducers/index.js');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}

const store = makeStore({});

// fire redux-responsive on window resize event
window.addEventListener('resize', debounce(() =>
  store.dispatch(calculateResponsiveState(window)), 150));

export default store;
