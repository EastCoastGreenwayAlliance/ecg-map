import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ReactGA from 'react-ga/src/index'; // have to import from the src path

import { gaTrackingID } from './common/config';
import store from './store'; // default redux store
import HomeConnected from './containers/HomeConnected';
import CueSheetConnected from './containers/CueSheetConnected';
import NotFound from './views/404';

// initialize React Google Analytics
ReactGA.initialize(gaTrackingID, {
  debug: process.env.NODE_ENV !== 'production',
  titleCase: true,
  gaOptions: {
    forceSSL: true,
    viewportSize: `${store.getState().browser.width}x${store.getState().browser.height}`
  }
});

// log the page we're on and any search query params
function logPageView() {
  ReactGA.set({ page: window.location.pathname + window.location.search });
  ReactGA.pageview(window.location.pathname + window.location.search);
}

const App = () => (
  <Provider store={store}>
    <Router onUpdate={logPageView}>
      <Switch>
        <Route exact path="/" component={HomeConnected} />
        <Route path="/cuesheet" component={CueSheetConnected} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  </Provider>
);

export default App;
