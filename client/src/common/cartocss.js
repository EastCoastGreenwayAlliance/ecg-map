import sls from 'single-line-string';

import { cartoTables } from './config';

const { route_segments, alert_points } = cartoTables;

// CartoCSS for styling the ECG Route
// this is passed to Carto(db).JS' createLayer() method
export const cartocss = sls`
  /* color values */
  @casing_light: #FFF;
  @casing_dark: #333;
  @route: #b6f8ff;
  @trail: #cbfe00;
  @transit: yellow;

  #${route_segments}{
    /* casing so that route shows up over satellite imagery */
    ::outer {
      line-color: @casing_dark;
      line-width: 3.5;
      line-join: round;
      line-opacity: 1;

      [line_type = 'Transit or Ferry'] {
        line-color: @casing_dark;
        line-opacity: 0.6;
      }

      [zoom <= 6] {
        line-simplify: 0.2;
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
      line-opacity: 1;

      [zoom <= 6] {
        line-simplify: 0.2;
      }

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

export const cartocss_alerts = sls`
  #${alert_points} {
    marker-allow-overlap: true;
    marker-type: ellipse;
    marker-opacity: 0.8;
    marker-fill: red;

    [zoom < 12] {  /* below this Z just don't show the alert markers */
      marker-width: 0;
      marker-height: 0;
    }

    marker-width: 13;
    marker-height: 13;
    [zoom >= 14] {
      marker-width: 15;
      marker-height: 15;
    }
    [zoom >= 16] {
      marker-width: 18;
      marker-height: 18;
    }
    [zoom >= 18] {
      marker-width: 20;
      marker-height: 20;
    }
  }
`;
