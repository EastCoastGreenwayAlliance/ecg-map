import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ActiveTurningReadout extends Component {
  static propTypes = {
    enabled: PropTypes.bool.isRequired,
    currentplace: PropTypes.string,
    disableActiveTurning: PropTypes.func.isRequired,
    distance: PropTypes.string,
    transition_text: PropTypes.string,
    transition_code: PropTypes.string,
    onpath: PropTypes.bool.isRequired,
    isMobile: PropTypes.bool.isRequired,
    error: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.offRouteMessage = 'You don\'t appear to be on the highlighted portion of the East Coast Greenway route.';
    this.state = {
      cueMessage: props.onpath ? props.transition_text : this.offRouteMessage
    };
  }

  componentWillReceiveProps(nextProps) {
    const { currentplace, onpath, transition_text, enabled, error } = nextProps;

    // when the user toggles the active turning feature, tell them it's working
    if (enabled && !this.props.enabled && !transition_text && !currentplace) {
      this.setState({
        cueMessage: 'determining your location...'
      });
    }

    // active turning has been enabled and someone is on path and we have transition text
    if (enabled && this.props.enabled && onpath && transition_text) {
      this.setState({
        cueMessage: transition_text
      });
    }

    // active turning has been enabled and someone is off path
    if (enabled && this.props.enabled && !onpath && currentplace) {
      this.setState({
        cueMessage: currentplace
      });
    }

    if (error && !this.props.error) {
      this.setState({
        cueMessage: error.message || 'your location could not be determined'
      });
    }
  }

  render() {
    const { cueMessage } = this.state;
    const { enabled, disableActiveTurning, distance, onpath, transition_code,
      isMobile } = this.props;

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
              <p className="active-turning-on-path-cue"><span>{ distance }</span>{` ${cueMessage}`}</p> :
              <p className="active-turning-off-path-cue">{ cueMessage }</p>
          }
        </div>
      </div>
    );
  }
}

export default ActiveTurningReadout;
