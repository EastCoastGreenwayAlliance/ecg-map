import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { logCueSheetBtnClick } from '../common/googleAnalytics';

class RouteShowCueSheet extends Component {
  render() {
    return (
      <Link to={'/cuesheet'}>
        <button
          className="dps dps-print"
          title="Print or View Cuesheet"
          tabIndex={0}
          onClick={() => logCueSheetBtnClick()}
        >
          <span />
        </button>
      </Link>
    );
  }
}

export default RouteShowCueSheet;
