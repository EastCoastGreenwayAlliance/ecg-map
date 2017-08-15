import ReactGA from 'react-ga/src/index'; // have to import from the src path

// The following are all the uses of Google Analytics to log custom events in the app

// log the search event in Google Analytics
export const logLocationSearch = (startAccepted, searchAddress) => {
  ReactGA.event({
    category: 'Search',
    action: !startAccepted ? 'Start location search' : 'End location search',
    label: searchAddress
  });
};

// log cue sheet button click with Google Analytics
export const logCueSheetBtnClick = () => {
  // record the Cuesheet Button event
  ReactGA.event({
    category: 'Post Route Search Options',
    action: 'Button Click',
    label: 'Cuesheet view'
  });
};

export const logDownloadGPX = () => {
  // log the GPX file download event
  ReactGA.event({
    category: 'Post Route Search Options',
    action: 'Button Click',
    label: 'GPX download'
  });
};

export const logStatefulURLCopy = () => {
  // log the copy event
  ReactGA.event({
    category: 'Post Route Search Options',
    action: 'Button Click',
    label: 'Stateful URL Copy'
  });
};

export const logRouteSearchRequest = () => {
  // log that a route search was made
  ReactGA.event({
    category: 'Routing',
    action: 'Route Search Request',
    label: 'Route Search Request'
  });
};

export const logRouteSearchSuccess = () => {
  // log a successful route search
  ReactGA.event({
    category: 'Routing',
    action: 'Route Search Success',
    label: 'Route Search Success'
  });
};

export const logRouteSearchTime = (timeEllapsed) => {
  ReactGA.timing({
    category: 'Routing',
    variable: 'Route calculation time',
    value: timeEllapsed,
    label: 'Route Search Time'
  });
};

/** Error Logging */
export const logGeocodeError = (error, store) => {
  ReactGA.event({
    category: 'App Errors',
    action: 'Geocode Error',
    label: (error.message || error) +
      store.getState().geocoding.searchTerm
  });
};

export const logRouteLocationError = (error) => {
  ReactGA.event({
    category: 'App Errors',
    action: 'Location Search Error',
    label: error.message || error
  });
};

export const logMailchimpError = (error) => {
  ReactGA.event({
    category: 'App Errors',
    action: 'Mailchimp signup error',
    label: error.message || error
  });
};

export const logElevDataRequestError = (error) => {
  ReactGA.event({
    category: 'App Errors',
    action: 'Elevation Data Request Error',
    label: error.message || error
  });
};

export const logActiveTurningError = (error) => {
  ReactGA.event({
    category: 'App Errors',
    action: 'Active Turning Error',
    label: error.message || error
  });
};

// the error we care about: when a user searched for a route and received a "no route found" message
export const logRouteSearchError = () => {
  ReactGA.event({
    category: 'App Errors',
    action: 'Route Search Error',
    label: window.location.search
  });
};
