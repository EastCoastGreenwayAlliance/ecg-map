import React from 'react';
import PropTypes from 'prop-types';

import LoadingMsg from '../LoadingMsg';
import ErrorMsg from '../ErrorMsg';

// Options to show the user after they've accepted a end location
const EndLocationAcceptedOptions = (props) => {
  const { route } = props;
  const { isLoadingRoute, error, response } = route;

  function loadingMessage() {
    if (isLoadingRoute) {
      return <LoadingMsg message={'Calculating route...'} />;
    }
    return null;
  }

  function errorMessage() {
    if (error) {
      return <ErrorMsg error={error} />;
    }

    // the response could also contain an error message for "no route found"
    // because we are keeping the network connection open we need to check for it here
    if (response && response.error) {
      return <ErrorMsg error={response.error} />;
    }

    return null;
  }

  return (
    <div className="SearchEndAcceptedOptions">
      <div className="start-description">
        <img
          alt="start-icon"
          className="map-marker"
          ref={(_) => { this.img1 = _; }}
          src="assets/icons/icon-search-marker-green.svg"
          onError={() => {
            // handles the SVG fallback
            this.img1.src = '/assets/icons/icon-search-marker-green.png';
            this.img1.onerror = null;
          }}
        />
        <p className="search-label">Starting Location</p>
      </div>
      <div className="end-description">
        <img
          alt="start-icon"
          className="map-marker"
          ref={(_) => { this.img2 = _; }}
          src="assets/icons/icon-search-marker-red.svg"
          onError={() => {
            // handles the SVG fallback
            this.img2.src = '/assets/icons/icon-search-marker-red.png';
            this.img2.onerror = null;
          }}
        />
        <p className="search-label">Ending Location</p>
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
