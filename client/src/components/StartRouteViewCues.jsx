import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { logCueSheetBtnClick } from '../common/googleAnalytics';

// This UI only displays on mobile, it's purpose is to allow someone to
// follow the ECG route while also viewing the next upcoming cue
const StartRouteViewCues = (props) => {
  const { activeTurningEnabled, isMobile, route, enableActiveTurning } = props;

  if (isMobile && route.response && !activeTurningEnabled) {
    return (
      <div className="StartRouteViewCues">
        <button className="center blue" onClick={() => enableActiveTurning()}>Start Route</button>
        <Link to={'/cuesheet'} style={{ textDecoration: 'none' }}>
          <button
            className="center blue"
            onClick={() => logCueSheetBtnClick()}
          >
            View Cues
          </button>
        </Link>
      </div>
    );
  }

  return null;
};

StartRouteViewCues.propTypes = {
  activeTurningEnabled: PropTypes.bool.isRequired,
  enableActiveTurning: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  route: PropTypes.object,
};

export default StartRouteViewCues;
