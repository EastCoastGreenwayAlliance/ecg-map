import sls from 'single-line-string';

import { cartoTables } from './config';

const { route_segments } = cartoTables;

const cartocss = sls`
  #${route_segments}{

    /* casing so that route shows up over satellite imagery */
    ::outer {
      line-color: #FFF;
      line-width: 3.5;
      line-opacity: 0.7;

      [zoom > 16] {
        line-width: 5;
      }

      [zoom > 18] {
        line-width: 7;
      }
    }

    ::inner {
      line-color: #FF6600;
      line-width: 2;
      line-opacity: 0.7;

      [zoom > 16] {
        line-width: 3;
      }

      [zoom > 18] {
        line-width: 4;
      }
    }
  }
`;

export default cartocss;
