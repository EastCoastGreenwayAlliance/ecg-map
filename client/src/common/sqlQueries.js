import sls from 'single-line-string';

import { cartoTables } from './config';

const { route_segments } = cartoTables;

// SQL for loading the route from CARTO via Carto(db).JS
const configureMapSQL = () => sls`
  SELECT * FROM ${route_segments}
`;

export default configureMapSQL;
