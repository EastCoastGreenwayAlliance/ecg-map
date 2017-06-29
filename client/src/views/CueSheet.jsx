import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import NavBar from '../components/NavBar';
import { metersToMiles } from '../common/api';

/** Class that handles displaying a list of turn by turn directions (cues)
    to the user as a separate page so that they may print the list from their
    browser */
class CueSheet extends Component {
  static propTypes = {
    route: PropTypes.object,
    isMobile: PropTypes.bool
  }

  renderCues() {
    const { route } = this.props;
    const { response } = route;
    let cues = [];

    if (!response || !response.features || !response.features.length) return null;

    cues.push(
      <li key={0}>
        <span className={'turn-icon'} />
        <div>
          <p style={{ margin: 0 }}>Starting on { response.features[0].properties.title }</p>
          <p>{ metersToMiles(response.features[0].properties.length) } miles</p>
        </div>
      </li>
    );

    cues = cues.concat(response.features.map((feature, idx, arr) => {
      const { properties } = feature;
      const nextSegment = arr[idx + 1];

      return (
        <li key={properties.id}>
          <span className={`turn-icon turn-icon-${properties.transition.code}`} />
          <div>
            <p>
              { properties.transition.title }
            </p>
            {
              nextSegment ?
                <p>{ metersToMiles(nextSegment.properties.length) } miles</p> : <p />
            }
          </div>
        </li>
      );
    }));

    return cues;
  }

  render() {
    const { isMobile } = this.props;
    return (
      <div className="CueSheet">
        <NavBar {...{ isMobile }} />
        <div className="cues-container">
          <h3>Cue Sheet</h3>
          <p><Link to="/">Back to Map</Link></p>
          <ol>
            { this.renderCues() }
          </ol>
          <p><Link to="/">Back to Map</Link></p>
        </div>
      </div>
    );
  }
}

export default CueSheet;
