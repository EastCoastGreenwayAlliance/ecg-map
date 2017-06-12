import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

import { cartoUser, cartoTables } from '../../common/config';
// geo router
import ROUTER from '../../../lib/ecgClientRouter';

ROUTER.init(cartoUser, cartoTables.route_segments);

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

    if (typeof geocodeError === 'string') {
      return geocodeError;
    }

    if (typeof geocodeError === 'object') {
      return geocodeError.message ?
        `${geocodeError.message}, please try again.` :
        'Something went wrong, please try again.';
    }
  }

  handleGeocodeResult(result) {
    const { geometry } = result;
    const { startLocation, endLocation } = this.props;
    const self = this;

    if (!geometry.lat || !geometry.lng) return;

    // if no start location has been set then get the nearest ECG segment,
    // and we'll call that the start location
    if (!startLocation.accepted && !endLocation.accepted) {
      const { lat, lng } = geometry;
      ROUTER.findNearestSegmentToLatLng(lat, lng, undefined,
        closestSegment => self.handleGeoRoutingSuccess(closestSegment, 'START'),
        error => self.handleGeoRoutingError(error)
      );
    }

    // if we have a start location and not an end location, get the nearest ECG segment
    // and we'll call that the end location
    if (startLocation.accepted && !endLocation.accepted) {
      const { lat, lng } = geometry;
      ROUTER.findNearestSegmentToLatLng(lat, lng, undefined,
        closestSegment => self.handleGeoRoutingSuccess(closestSegment, 'END'),
        error => self.handleGeoRoutingError(error)
      );
    }

    // TO DO: need a way to start over if start and end locations are both accepted
  }

  handleGeoRoutingSuccess(closestSegment, step) {
    const { closest_lat, closest_lng } = closestSegment;
    this.props.setRoutingLocation([closest_lng, closest_lat], step);
  }

  handleGeoRoutingError(error) {
    this.props.nearestSegmentError(error);
  }

  render() {
    const { geocodeError, geocodeResult } = this.props;

    return (
      <div className="SearchResults">
        {
          geocodeError &&
          <div className="searchbox__error-msg">
            { this.handleGeocodeError() }
          </div>
        }
        {
          geocodeResult &&
          <div>
            { geocodeResult.addressFormatted }
          </div>
        }
      </div>
    );
  }
}

export default SearchResults;
