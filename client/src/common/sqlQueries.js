import sls from 'single-line-string';

import { cartoTables } from './config';

const { route_segments, alert_points } = cartoTables;

// SQL for loading the route from CARTO via Carto(db).JS
export const configureMapSQL = () => sls`
  SELECT * FROM ${route_segments}
`;
// GDA is this still in use?
