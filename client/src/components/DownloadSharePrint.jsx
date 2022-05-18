import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RouteDownloadGPX from './RouteDownloadGPX';
import RouteDownloadTCX from './RouteDownloadTCX';
import RouteShare from './RouteShare';
import RouteShowCueSheet from './RouteShowCueSheet';

class DownloadSharePrint extends Component {
  static propTypes = {
    route: PropTypes.object,
    isMobile: PropTypes.bool.isRequired,
  }

  render() {
    const { route, isMobile } = this.props;

    if (!route.response || !route.response.features) return null;

    // don't show this component on mobile, it isn't useful & takes up space
    if (isMobile) return null;

    return (
      <div className="DownloadSharePrint">
        <RouteDownloadGPX route={route} />
        <RouteDownloadTCX route={route} />
        <RouteShare />
        <RouteShowCueSheet />
      </div>
    );
  }
}

export default DownloadSharePrint;
