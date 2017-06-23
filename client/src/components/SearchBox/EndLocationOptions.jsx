import React from 'react';
import PropTypes from 'prop-types';

import { metersToMiles } from '../../common/api';

// Options to show the user after they've accepted the end location
const EndLocationOptions = (props) => {
  const { endLocation, acceptRoutingLocation, geocodeResult } = props;

  return (
    <div className="SearchEndOptions">
      <p>
        { `The nearest Greenway location to ${geocodeResult.addressFormatted} is `}
        <span className="bold">{`${metersToMiles(endLocation.distance)} miles`}</span>
        { ' away.' }
      </p>
      <button className="center blue" tabIndex="0" onClick={() => acceptRoutingLocation('END')}>
        Use this Greenway location as your end point
      </button>
    </div>
  );
};

EndLocationOptions.propTypes = {
  endLocation: PropTypes.object,
  acceptRoutingLocation: PropTypes.func.isRequired,
  geocodeResult: PropTypes.object,
};

export default EndLocationOptions;
