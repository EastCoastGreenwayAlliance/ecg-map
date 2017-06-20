import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

import { cartoUser, cartoTables } from '../../common/config';
import { loadGeoRouter } from '../../common/api';

// helper function to convert meters to miles
const metersToMiles = x => +parseFloat(x * 0.000621371).toFixed(2);

/** Class that handles displaying location search results & geo-routing results */
class SearchResults extends Component {
  static propTypes = {
    nearestSegmentError: PropTypes.func.isRequired,
    setRoutingLocation: PropTypes.func.isRequired,
    acceptRoutingLocation: PropTypes.func.isRequired,
    cancelRoutingLocation: PropTypes.func.isRequired,
    routeSearchRequest: PropTypes.func.isRequired,
    routeSearchSuccess: PropTypes.func.isRequired,
    routeSearchError: PropTypes.func.isRequired,
    geocodeError: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    geocodeResult: PropTypes.object,
    startLocation: PropTypes.object,
    endLocation: PropTypes.object,
    route: PropTypes.object,
  }

  constructor() {
    super();
    // Placeholder for the geo routing algorithm
    // not imported immediately due to its dependency, JSTS, being a large file size
    // instead we load it async after the user performs a search
    // see Webpack documenation for more info: https://webpack.js.org/guides/code-splitting-async/
    this.geoRouter = undefined;
  }

  componentWillReceiveProps(nextProps) {
    const { geocodeResult, startLocation, endLocation } = nextProps;

    if (!isEqual(geocodeResult, this.props.geocodeResult)) {
      // We received a geocode result from the user, so show the geocode result
      // and nearest ECG route segment node
      // CODE SPLITTING NOTE: if our geoRouter object hasn't been loaded yet,
      // then load it async then handle the geocode result
      // otherwise just handle the geocode result
      if (this.geoRouter === undefined) {
        loadGeoRouter((error, response) => {
          if (error) throw error;
          this.geoRouter = response.default;
          this.geoRouter.init(cartoUser, cartoTables.route_segments);
          this.handleGeocodeResult(geocodeResult);
        });
      } else {
        this.handleGeocodeResult(geocodeResult);
      }
    }

    // user has okay'd start and end locations, now get the actual route
    if (startLocation.accepted && endLocation.accepted && !this.props.endLocation.accepted) {
      this.getRoute(startLocation, endLocation);
    }
  }

  getRoute(startLocation, endLocation) {
    // handles making the geo routing search request
    // tell our app we are starting the search for a geo route
    this.props.routeSearchRequest();
    // make the findRoute call from our geoRouter, passing coordinates for
    // start and end locations, and callbacks for success and error
    this.geoRouter.findRoute(
      startLocation.coordinates[0],
      startLocation.coordinates[1],
      endLocation.coordinates[0],
      endLocation.coordinates[1],
      route => this.props.routeSearchSuccess(route),
      error => this.props.routeSearchError(error)
    );
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

      this.geoRouter.findNearestSegmentToLatLng(lat, lng,
        closestSegment => self.handleGeoRoutingSuccess(closestSegment, 'START'),
        error => self.handleGeoRoutingError(error),
        {
          trailonly: true
        }
      );
    }

    // if we have a start location and not an end location, get the nearest ECG segment
    // and we'll call that the end location
    if (startLocation.accepted && !endLocation.accepted) {
      const lat = coordinates[0];
      const lng = coordinates[1];

      this.geoRouter.findNearestSegmentToLatLng(lat, lng,
        closestSegment => self.handleGeoRoutingSuccess(closestSegment, 'END'),
        error => self.handleGeoRoutingError(error),
        {
          trailonly: true
        }
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

  showPostStartOptions() {
    return (
      <div className="search-results__ui search-results__post-start">
        <p>Search End Point or:</p>
        <button className="center blue" onClick={() => {}}>
          View North Cues
        </button>
        <button className="center blue" onClick={() => {}}>
          View South Cues
        </button>
      </div>
    );
  }

  showEndOptions() {
    const { endLocation, acceptRoutingLocation } = this.props;

    return (
      <div className="search-results__ui search-results__end">
        <p>
          { ' The nearest Greenway location is '}
          <span className="bold">{`${metersToMiles(endLocation.distance)} miles`}</span>
          { ' away.' }
        </p>
        <button className="center blue" onClick={() => acceptRoutingLocation('END')}>
          Use this Greenway location as your end point
        </button>
      </div>
    );
  }

  showPostEndOptions() {
    return (
      <div className="search-results__ui search-results__post-end">
        <p>TO DO...</p>
      </div>
    );
  }

  renderSearchResultsStep() {
    // handles which step of the Search UX Flow to display using application state
    const { geocodeError, startLocation, endLocation } = this.props;

    if (geocodeError) {
      return this.handleGeocodeError();
    }

    if (startLocation.distance && !startLocation.accepted) {
      return this.showStartOptions();
    }

    if (startLocation.accepted && !endLocation.coordinates.length) {
      return this.showPostStartOptions();
    }

    if (endLocation.coordinates.length && !endLocation.accepted) {
      return this.showEndOptions();
    }

    if (endLocation.accepted && startLocation.accepted) {
      return this.showPostEndOptions();
    }

    return null;
  }

  render() {
    return (
      <div className="SearchResults">
        { this.renderSearchResultsStep() }
      </div>
    );
  }
}

export default SearchResults;
