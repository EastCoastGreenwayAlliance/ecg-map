import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import NavBar from '../components/NavBar';
import { metersToMiles } from '../common/api';

class CueSheet extends Component {
  static propTypes = {
    route: PropTypes.object,
    isMobile: PropTypes.bool
  }

  renderCues() {
    const { route } = this.props;
    const { response } = route;

    if (!response || !response.features || !response.features.length) return null;

    return response.features.map((feature, idx) => {
      const { properties } = feature;

      if (idx === 0) {
        return (
          <li key={properties.id}>
            <p style={{ margin: 0 }}>Starting on { properties.title }</p>
          </li>
        );
      }

      return (
        <li key={properties.id}>
          { idx === 0 ? <p>Starting on { properties.title }</p> : null }
          <p>{ properties.transition.title }</p>
          <p>{ metersToMiles(properties.length) } miles</p>
        </li>
      );
    });
  }

  render() {
    const { isMobile } = this.props;
    return (
      <div className="CueSheet">
        <NavBar {...{ isMobile }} />
        <div className="cues-container">
          <h3>Cue Sheet</h3>
          <p><Link to="/">Back to Map</Link></p>
          <ul>
            { this.renderCues() }
          </ul>
          <p><Link to="/">Back to Map</Link></p>
        </div>
      </div>
    );
  }
}

export default CueSheet;
