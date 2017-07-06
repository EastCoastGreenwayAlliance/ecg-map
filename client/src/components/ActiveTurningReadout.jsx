import React from 'react';
import PropTypes from 'prop-types';

const ActiveTurningReadout = (props) => {
  const { enabled, disableActiveTurning, distance, onpath, transition_code,
    transition_text, isMobile } = props;

  // only want to display this on mobile and if active turning is enabled
  if (!isMobile || !enabled) return null;

  return (
    <div className="ActiveTurningReadout">
      <div className="active-turning-cancel">
        <button className="button-cancel" onClick={() => disableActiveTurning()}>Cancel</button>
      </div>
      <div className="active-turning-cue">
        <span className={`active-turning-icon turn-icon turn-icon-${transition_code}`} />
        {
          onpath ?
            <p className="active-turning-on-path-cue"><span>{ distance }</span>{` ${transition_text}`}</p> :
            <p className="active-turning-off-path-cue">
              You don't appear to be on the highlighted portion of the
              East Coast Greenway route.
            </p>
        }
      </div>
    </div>
  );
};

ActiveTurningReadout.propTypes = {
  enabled: PropTypes.bool.isRequired,
  currentplace: PropTypes.string,
  disableActiveTurning: PropTypes.func.isRequired,
  distance: PropTypes.string,
  transition_text: PropTypes.string,
  transition_code: PropTypes.string,
  onpath: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default ActiveTurningReadout;
