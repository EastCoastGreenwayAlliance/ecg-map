import sls from 'single-line-string';

import { cartoTables } from './config';

const { route_segments } = cartoTables;

const configureMapSQL = () => sls`
  SELECT * FROM ${route_segments}
`;

export default configureMapSQL;
