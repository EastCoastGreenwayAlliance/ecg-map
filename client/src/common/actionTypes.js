// Redux Action Types, see: http://redux.js.org/docs/basics/Actions.html

// Geocoding a search location
export const LOCATION_GEOCODE_REQUEST = 'LOCATION_GEOCODE_REQUEST';
export const LOCATION_GEOCODE_SUCCESS = 'LOCATION_GEOCODE_SUCCESS';
export const LOCATION_GEOCODE_ERROR = 'LOCATION_GEOCODE_ERROR';

// UX flow for accepting, setting, or canceling a routing location (start or end)
export const SET_ROUTING_LOCATION = 'SET_ROUTING_LOCATION';
export const ACCEPT_ROUTING_LOCATION = 'ACCEPT_ROUTING_LOCATION';
export const CANCEL_ROUTING_LOCATION = 'CANCEL_ROUTING_LOCATION';
export const ROUTING_LOCATION_ERROR = 'ROUTING_LOCATION_ERROR';

// email sign up in the intro modal
export const MAILCHIMP_POST_REQUEST = 'MAILCHIMP_POST_REQUEST';
export const MAILCHIMP_POST_SUCESS = 'MAILCHIMP_POST_SUCESS';
export const MAILCHIMP_POST_ERROR = 'MAILCHIMP_POST_ERROR';
