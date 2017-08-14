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

    if (!response || !response.features || !response.features.length) return null;

    let cues = [];
    const imageBaseURL = '/assets/icons/';
    // starting cumulative mileage is always 0
    let cumulativeMiles = 0;

    const transitionCodeImageMap = (code) => {
      switch (code) {
        case 'AR':
          return `${imageBaseURL}/icon-search-marker-red.svg`;
        case 'RT':
        case 'RH':
          return `${imageBaseURL}/icon-arrow-right.svg`;
        case 'RS':
          return `${imageBaseURL}/icon-arrow-bear-right.svg`;
        case 'LT':
        case 'LH':
          return `${imageBaseURL}/icon-arrow-left.svg`;
        case 'LS':
          return `${imageBaseURL}/icon-arrow-bear-left.svg`;
        case 'ST':
          return `${imageBaseURL}/icon-arrow-straight.svg`;
        default:
          return null;
      }
    };

    // first cue
    cues.push(
      <tr key={0}>
        <td>
          <p>{ cumulativeMiles }</p>
        </td>
        <td>
          <img className="turn-icon" alt="start icon" src={`${imageBaseURL}icon-search-marker-green.svg`} />
        </td>
        <td>
          <p style={{ margin: 0 }}>Starting on { response.features[0].properties.title }</p>
        </td>
        <td>
          <p>{ metersToMiles(response.features[0].properties.length) }</p>
        </td>
      </tr>
    );

    cues = cues.concat(response.features.map((feature, idx, arr) => {
      const { properties } = feature;
      const nextSegment = arr[idx + 1];
      // sum cumulative miles with the segment's length
      // math uses 2 decimal places but client requested 1 decimal place for readout in cuesheet
      cumulativeMiles += metersToMiles(properties.length);
      // note that transition title is for the next turn direction and that
      // the segment length column reflects the length of the next segment, not the current one

      return (
        <tr key={properties.id}>
          <td>
            <p>{ cumulativeMiles.toFixed(1) }</p>
          </td>
          <td>
            <img
              className="turn-icon"
              src={transitionCodeImageMap(properties.transition.code)}
              alt="turn icon"
            />
          </td>
          <td>
            <p>{ properties.transition.title }</p>
          </td>
          <td>
            {
              nextSegment ?
                <p>{ metersToMiles(nextSegment.properties.length).toFixed(1) }</p> : <p />
            }
          </td>
        </tr>
      );
    }));

    return cues;
  }

  render() {
    const { isMobile, route } = this.props;
    const { response } = route;
    const header1 = isMobile ? 'Cum. miles' : 'Cumulative miles';
    const header2 = isMobile ? 'Seg. miles' : 'Segment miles';

    return (
      <div className="CueSheet">
        <NavBar {...{ isMobile }} />
        <div className="cues-container">
          {
            (response && response.features) ?
              <div>
                <p className="nav-link"><Link to="/">Back to Map</Link></p>
                <button className="print" onClick={() => window.print()} />
                <table>
                  <thead>
                    <tr>
                      <th><p>{ header1 }</p></th>
                      <th colSpan="2"><p>Cue</p></th>
                      <th><p>{ header2 }</p></th>
                    </tr>
                  </thead>
                  <tbody>
                    { this.renderCues() }
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4">
                        <p className="nav-link"><Link to="/">Back to Map</Link></p>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div> :
              <p>No cues to show, try searching for a route on the <Link to="/">map</Link></p>
          }
        </div>
      </div>
    );
  }
}

export default CueSheet;
