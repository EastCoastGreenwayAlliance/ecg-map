import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ActiveTurningReadout extends Component {
  static propTypes = {
    nextStep: PropTypes.object,
  }

  render() {
    const { onpath, currentplace } = this.props.nextStep;
    const { distance } = this.props.nextStep;
    const { transition_code, transition_text } = this.props.nextStep;

    return (
      <div className="ActiveTurningReadout">
        <p>
          Currently: {{ currentplace }}
        </p>
        <p>
          {{ distance }} {{ transition_text }}
        </p>
        <p>
          Icon: {{ transition_code }}
        </p>
        <p>
          Is On Path? {{ onpath }}
        </p>
      </div>
    );
  }
}

export default ActiveTurningReadout;
