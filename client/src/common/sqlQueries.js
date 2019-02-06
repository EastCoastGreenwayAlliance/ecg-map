import sls from 'single-line-string';

import { cartoTables } from './config';

const { route_segments, alert_points } = cartoTables;

// SQL for loading the route from CARTO via Carto(db).JS
export const configureMapSQL = () => sls`
  SELECT * FROM ${route_segments}
`;

export const alertPointsSQL = () => sls`
  SELECT
  name, description, ST_X(the_geom) AS lng, ST_Y(the_geom) AS lat
  FROM ${alert_points}
  WHERE published
`;
