import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

import { cartoUser, cartoTables } from '../../common/config';
// geo router
import ROUTER from '../../../lib/ecgClientRouter';

ROUTER.init(cartoUser, cartoTables.route_segments);

// helper function to convert meters to miles
const metersToMiles = x => +parseFloat(x * 0.000621371).toFixed(2);

/** Class that handles displaying location search results & geo-routing results */
class SearchResults extends Component {
  static propTypes = {
    nearestSegmentError: PropTypes.func.isRequired,
    setRoutingLocation: PropTypes.func.isRequired,
    acceptRoutingLocation: PropTypes.func.isRequired,
    cancelRoutingLocation: PropTypes.func.isRequired,
    geocodeError: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    geocodeResult: PropTypes.object,
    startLocation: PropTypes.object,
    endLocation: PropTypes.object,
    route: PropTypes.object,
  }

  componentWillReceiveProps(nextProps) {
    const { geocodeResult } = nextProps;

    if (!isEqual(geocodeResult, this.props.geocodeResult)) {
      // we received a geocode result from the user, set the start / end location
      this.handleGeocodeResult(geocodeResult);
    }
  }

  handleGeocodeError() {
    const { geocodeError } = this.props;
    let errorMsg;

    if (typeof geocodeError === 'string') {
      errorMsg = geocodeError;
    }

    if (typeof geocodeError === 'object') {
      errorMsg = geocodeError.message ?
        `${geocodeError.message}, please try again.` :
        'Something went wrong, please try again.';
    }

    return (
      <div className="search-results__ui search-results__error-msg">
        <p>{ errorMsg }</p>
      </div>
    );
  }

  handleGeocodeResult(result) {
    const { coordinates } = result;
    const { startLocation, endLocation } = this.props;
    const self = this;

    if (!coordinates || !coordinates.length) return;

    // if no start location has been set then get the nearest ECG segment,
    // and we'll call that the start location
    if (!startLocation.accepted && !endLocation.accepted) {
      const lat = coordinates[0];
      const lng = coordinates[1];

      ROUTER.findNearestSegmentToLatLng(lat, lng, undefined,
        closestSegment => self.handleGeoRoutingSuccess(closestSegment, 'START'),
        error => self.handleGeoRoutingError(error)
      );
    }

    // if we have a start location and not an end location, get the nearest ECG segment
    // and we'll call that the end location
    if (startLocation.accepted && !endLocation.accepted) {
      const lat = coordinates[0];
      const lng = coordinates[1];

      ROUTER.findNearestSegmentToLatLng(lat, lng, undefined,
        closestSegment => self.handleGeoRoutingSuccess(closestSegment, 'END'),
        error => self.handleGeoRoutingError(error)
      );
    }

    // TO DO: implement cancel
  }

  handleGeoRoutingSuccess(closestSegment, step) {
    const { closest_lat, closest_lng, closest_distance } = closestSegment;
    this.props.setRoutingLocation([closest_lat, closest_lng], closest_distance, step);
  }

  handleGeoRoutingError(error) {
    this.props.nearestSegmentError(error);
  }

  showStartOptions() {
    const { geocodeResult, startLocation, acceptRoutingLocation } = this.props;
    const directionsURL = `https://www.google.com/maps/dir/?api=1&origin=${geocodeResult.coordinates}&destination=${startLocation.coordinates}`;

    return (
      <div className="search-results__ui search-results__start">
        <p>
          { ' The nearest Greenway location is '}
          <span className="bold">{`${metersToMiles(startLocation.distance)} miles`}</span>
          { ' away.' }
        </p>
        <button className="center green" onClick={() => window.open(directionsURL)}>
          Get Directions to the Greenway
        </button>
        <button className="center blue" onClick={() => acceptRoutingLocation('START')}>
          Use this Greenway location as your starting point
        </button>
      </div>
    );
  }

  render() {
    const { geocodeError, startLocation } = this.props;

    return (
      <div className="SearchResults">
        {
          geocodeError &&
            this.handleGeocodeError()
        }
        {
          (startLocation.distance && !startLocation.accepted) &&
            this.showStartOptions()
        }
      </div>
    );
  }
}

export default SearchResults;
