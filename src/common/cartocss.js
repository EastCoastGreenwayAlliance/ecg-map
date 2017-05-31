import sls from 'single-line-string';

import { cartoTables } from './config';

const { route_segments } = cartoTables;

const cartocss = sls`
  /* color values */
  @casing_light: #FFF;
  @casing_dark: #333;
  @route: #FF6600;
  @trail: purple;
  @transit: yellow;

  #${route_segments}{
    /* casing so that route shows up over satellite imagery */
    ::outer {
      line-color: @casing_light;
      line-width: 3.5;
      line-join: round;
      line-opacity: 0.7;

      [line_type = 'Transit or Ferry'] {
        line-color: @casing_dark;
        line-opacity: 0.6;
      }

      [zoom >= 14] {
        line-width: 5;
      }

      [zoom >= 18] {
        line-width: 7;
      }
    }

    ::inner {
      line-color: @route;
      line-width: 2;
      line-join: round;
      line-opacity: 0.7;

      [line_type = 'Trail'] {
        line-color: @trail;
      }

      [line_type = 'Trail, unpaved'] {
        line-color: @trail;
        line-dasharray: 4,4;
      }

      [line_type = 'Transit or Ferry'] {
        line-color: @transit;
      }

      [zoom >= 14] {
        line-width: 3;
      }

      [zoom >= 18] {
        line-width: 4;
      }
    }
  }
`;

export default cartocss;
