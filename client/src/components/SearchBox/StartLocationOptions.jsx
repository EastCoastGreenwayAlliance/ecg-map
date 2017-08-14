import React from 'react';
import PropTypes from 'prop-types';

import { metersToMiles } from '../../common/api';

// Options to show user following a successful geocode of their search start location
const StartLocationOptions = (props) => {
  const { geocodeResult, startLocation, acceptRoutingLocation } = props;
  const directionsURL = `https://www.google.com/maps/dir/?api=1&origin=${geocodeResult.coordinates}&destination=${startLocation.coordinates}`;

  return (
    <div className="SearchStartOptions">
      <p>
        { `The nearest Greenway location to ${geocodeResult.addressFormatted} is `}
        <span className="bold">{`${metersToMiles(startLocation.distance, 2)} miles`}</span>
        { ' away.' }
      </p>
      <button className="center green" tabIndex="0" onClick={() => window.open(directionsURL)}>
        Get Directions to the Greenway
      </button>
      <button className="center blue" tabIndex="0" onClick={() => acceptRoutingLocation('START')}>
        Use this Greenway location as your starting point
      </button>
    </div>
  );
};

StartLocationOptions.propTypes = {
  geocodeResult: PropTypes.object,
  startLocation: PropTypes.object,
  acceptRoutingLocation: PropTypes.func.isRequired,
};

export default StartLocationOptions;
