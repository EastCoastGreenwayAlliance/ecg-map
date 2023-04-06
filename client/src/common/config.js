// App wide configuration goes here
export const googleAPIKey = 'AIzaSyAFBQ5xLgNikyYrlnfvbfODyO35g3k-IkU';
// Google Analytics tracking id
export const gaTrackingID = 'UA-20533957-3';

// Esri layers for satellite and streets (replace Mapbox Dec 2019)
export const esriSatellite = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}@2x';

// route segment field names to appear within InfoWindows / PopUps
export const routeSegmentsFieldsVisible = [
  'line_type',
  'direction',
  'meters',
  'title',
];

// route segment fields for SQL queries
export const routeSegmentFieldsSQL = [
  ...routeSegmentsFieldsVisible,
  'cartodb_id',
  'the_geom',
  'south_weight',
  'north_weight',
  'pline_id',
];

// lat lon bounds that limit panning within the map's geographic area
export const maxGeoBounds = [[18.312811, -110.830078], [53.278353, -45.351563]];

// some universal constants such as unit conversions
export const METERS_TO_MILES = 1609;
export const METERS_TO_FEET = 3.281;

// the URL of the routing API server; in-development server-side routing is on :9000
// export const ROUTER_API_URL = 'https://router.greenway.org:9000/';
export const ROUTER_API_URL = 'https://router.greenway.org/';

// the URL of the WMS, used for serving the greenway linework for map display
export const ROUTER_WMS_URL = 'https://router.greenway.org/wms';

// the URL to fetch Alert POIs
export const ROUTER_ALERT_POIS_URL = 'https://router.greenway.org:9000/alertpois/';
// GDA remove 9000 before launch
