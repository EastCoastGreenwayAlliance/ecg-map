import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import '../scss/main.scss'; // tell webpack to use our scss
import App from './App';

const renderApp = (Component) => {
  render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root')
  );
};

renderApp(App);

// Enable Webpack's "Hot Module Replacement" for React Components
if (module.hot) {
  module.hot.accept('./App', () => renderApp(App));
}
