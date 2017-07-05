import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ActiveTurningReadout extends Component {
  static propTypes = {
    currentplace: PropTypes.string,
    distance: PropTypes.string,
    transition_text: PropTypes.string,
    transition_code: PropTypes.string,
    onpath: PropTypes.bool,
  }

  render() {
    const { onpath, currentplace, distance, transition_code, transition_text } = this.props;

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
          Is On Path? { onpath }
        </p>
      </div>
    );
  }
}

export default ActiveTurningReadout;
