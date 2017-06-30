import React from 'react';
import PropTypes from 'prop-types';

// This UI only displays on mobile, it's purpose is to allow someone to
// follow the ECG route while also viewing the next upcoming cue
const StartRouteViewCues = (props) => {
  const { isMobile, startLocation, endLocation } = props;

  if (isMobile && startLocation.accepted && endLocation.accepted) {
    return (
      <div className="StartRouteViewCues">
        <button className="center blue" onClick={() => {}}>Start Route</button>
        <button className="center blue" onClick={() => {}}>View Cues</button>
      </div>
    );
  }

  return null;
};

StartRouteViewCues.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  startLocation: PropTypes.object,
  endLocation: PropTypes.object,
};

export default StartRouteViewCues;
