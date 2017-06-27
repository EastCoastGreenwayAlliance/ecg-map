import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/** Class that displays UI and handles action creators for
    - download of GPX file
    - sharing of route via email
    - printing of cuesheet
*/

class DownloadSharePrint extends Component {
  static propTypes = {
    startLocation: PropTypes.object,
    endLocation: PropTypes.object,
    route: PropTypes.object
  }

  render() {
    const { route } = this.props;

    if (!route.response || !route.response.features) return null;

    return (
      <div className="DownloadSharePrint">
        <button className="dps-download" onClick={() => {}}><span /></button>
        <button className="dps-share" onClick={() => {}}><span /></button>
        <Link to={'/cuesheet'}>
          <button className="dps-print" onClick={() => {}}><span /></button>
        </Link>
      </div>
    );
  }
}

export default DownloadSharePrint;
