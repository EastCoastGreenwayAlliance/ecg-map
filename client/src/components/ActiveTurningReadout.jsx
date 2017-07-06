import React from 'react';
import PropTypes from 'prop-types';

const ActiveTurningReadout = (props) => {
  const { enabled, onpath, currentplace, distance, transition_code, transition_text,
    isMobile } = props;

  // only want to display this on mobile and if active turning is enabled
  if (!isMobile || !enabled) return null;

  return (
    <div className="ActiveTurningReadout">
      <p>
        Currently: { currentplace }
      </p>
      <p>
        { distance } { transition_text }
      </p>
      <p>
        Icon: { transition_code }
      </p>
      <p>
        Is On Path? { onpath ? 'yes' : 'no' }
      </p>
    </div>
  );
};

ActiveTurningReadout.propTypes = {
  enabled: PropTypes.bool.isRequired,
  currentplace: PropTypes.string,
  distance: PropTypes.string,
  transition_text: PropTypes.string,
  transition_code: PropTypes.string,
  onpath: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default ActiveTurningReadout;
