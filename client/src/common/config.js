// App wide configuration goes here
export const googleAPIKey = 'AIzaSyAFBQ5xLgNikyYrlnfvbfODyO35g3k-IkU';
export const gaTrackingID = '';

// CARTO account name (temporarily set to "greeninfo" until data is in order)
export const cartoUser = 'niles';

// CARTO tables
export const cartoTables = {
  route_segments: 'ecg_route_lines_prod',
  cue_points: 'ecg_route_cues_prod',
};

// Mapbox access token
const mbtoken = 'pk.eyJ1IjoiZWNnbmlsZXMiLCJhIjoiY2lyZHkxbmRqMDF5bGc3bTN2ajN0ZmNqbyJ9.29ONxUaTcSYUH3skP_FY1Q';
const mbOutdoors = 'cirdy2p7r000mh5m5xzg6pplr';
export const mbURL = `https://api.mapbox.com/styles/v1/ecgniles/${mbOutdoors}/tiles/256/{z}/{x}/{y}?access_token=${mbtoken}`;

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
