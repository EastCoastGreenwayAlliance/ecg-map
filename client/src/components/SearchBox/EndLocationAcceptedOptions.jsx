import React from 'react';
import PropTypes from 'prop-types';

import LoadingMsg from './LoadingMsg';
import ErrorMsg from './ErrorMsg';

// Options to show the user after they've accepted a end location
const EndLocationAcceptedOptions = (props) => {
  const { route } = props;
  const { isLoadingRoute, error } = route;

  function loadingMessage() {
    if (isLoadingRoute) {
      return <LoadingMsg message={'Calculating route...'} />;
    }
    return null;
  }

  function errorMessage() {
    if (error) {
      return <ErrorMsg {...{ error }} />;
    }
    return null;
  }

  return (
    <div className="SearchEndAcceptedOptions">
      <div className="start-description">
        <img alt="start-icon" className="map-marker" src="assets/icons/icon-map-marker-green@2x.png" />
        <p>Starting Location</p>
      </div>
      <div className="end-description">
        <img alt="start-icon" className="map-marker" src="assets/icons/icon-map-marker-red@2x.png" />
        <p>Ending Location</p>
      </div>
      { loadingMessage() }
      { errorMessage() }
    </div>
  );
};

EndLocationAcceptedOptions.propTypes = {
  route: PropTypes.object.isRequired,
};

export default EndLocationAcceptedOptions;
