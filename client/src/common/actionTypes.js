// Redux Action Types, see: http://redux.js.org/docs/basics/Actions.html

// Geocoding a search location
export const LOCATION_GEOCODE_REQUEST = 'LOCATION_GEOCODE_REQUEST';
export const LOCATION_GEOCODE_SUCCESS = 'LOCATION_GEOCODE_SUCCESS';
export const LOCATION_GEOCODE_ERROR = 'LOCATION_GEOCODE_ERROR';
export const LOCATION_GEOCODE_CLEAR = 'LOCATION_GEOCODE_CLEAR';

// UX flow for selecting a ECG Route start and end location:
// requesting, setting, accepting, canceling, and erroring
export const REQUEST_ROUTING_LOCATION = 'REQUEST_ROUTING_LOCATION'; // request nearest segment node
export const SET_ROUTING_LOCATION = 'SET_ROUTING_LOCATION'; // nearest segment node found
export const ACCEPT_ROUTING_LOCATION = 'ACCEPT_ROUTING_LOCATION'; // user confirms nearest segment node
export const CANCEL_ROUTING_LOCATION = 'CANCEL_ROUTING_LOCATION'; // user cancels current routing step
export const ROUTING_LOCATION_ERROR = 'ROUTING_LOCATION_ERROR'; // nearest segment node errored

// the actual route search between two locations
export const ROUTE_SEARCH_REQUEST = 'ROUTE_SEARCH_REQUEST';
export const ROUTE_SEARCH_SUCCESS = 'ROUTE_SEARCH_SUCCESS';
export const ROUTE_SEARCH_ERROR = 'ROUTE_SEARCH_ERROR';

// email sign up in the intro modal
export const MAILCHIMP_POST_REQUEST = 'MAILCHIMP_POST_REQUEST';
export const MAILCHIMP_POST_SUCESS = 'MAILCHIMP_POST_SUCESS';
export const MAILCHIMP_POST_ERROR = 'MAILCHIMP_POST_ERROR';

// elevation API request
export const ELEVATION_DATA_REQUEST = 'ELEVATION_DATA_REQUEST';
export const ELEVATION_DATA_SUCCESS = 'ELEVATION_DATA_SUCCESS';
export const ELEVATION_DATA_ERROR = 'ELEVATION_DATA_ERROR';
export const ELEVATION_DATA_CLEAR = 'ELEVATION_DATA_CLEAR';

// a geolocation-driven update to a "your turn is coming up" display
export const ACTIVE_TURNING_UPDATE = 'ACTIVE_TURNING_UPDATE';
export const ACTIVE_TURNING_ENABLE = 'ACTIVE_TURNING_ENABLE';
export const ACTIVE_TURNING_DISABLE = 'ACTIVE_TURNING_DISABLE';
