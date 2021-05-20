import React, { Component } from 'react';
import Clipboard from 'clipboard';

import { logStatefulURLCopy } from '../common/googleAnalytics';

class RouteShare extends Component {
  componentDidMount() {
    // enable copying of the URL to the user's clipboard
    if (Clipboard.isSupported()) {
      const copyFail = () => {
        alert('Your browser doesn\'t support copying with a button.');
      };

      const copySuccess = () => {
        alert('Route search copied! Feel free to paste and share.');
        // log the copy event
        logStatefulURLCopy();
      };

      new Clipboard('button.dps-share', {
        text: () => window.location.href
      })
      .on('success', copySuccess)
      .on('error', copyFail);
    }
  }

  render() {
    return (
      <button
        className="dps dps-share"
        title="Copy URL"
        tabIndex={0}
        onClick={() => {}}
      >
        <span />
      </button>
    );
  }
}

export default RouteShare;
