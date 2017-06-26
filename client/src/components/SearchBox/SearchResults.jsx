import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

import { cartoUser, cartoTables } from '../../common/config';
import { loadGeoRouter } from '../../common/api';

// helper components
import LoadingMsg from './LoadingMsg';
import ErrorMsg from './ErrorMsg';
import StartLocationOptions from './StartLocationOptions';
import StartLocationAcceptedOptions from './StartLocationAcceptedOptions';
import EndLocationOptions from './EndLocationOptions';
import EndLocationAcceptedOptions from './EndLocationAcceptedOptions';

/** Class that handles:
  - logic for selecting a portion of the ECG route
  - displaying location search results
  - displaying geo-routing results */
class SearchResults extends Component {
  static propTypes = {
    nearestSegmentRequest: PropTypes.func.isRequired,
    nearestSegmentError: PropTypes.func.isRequired,
    setRoutingLocation: PropTypes.func.isRequired,
    acceptRoutingLocation: PropTypes.func.isRequired,
    cancelRoutingLocation: PropTypes.func.isRequired,
    routeSearchRequest: PropTypes.func.isRequired,
    routeSearchSuccess: PropTypes.func.isRequired,
    routeSearchError: PropTypes.func.isRequired,
    fetchElevationData: PropTypes.func.isRequired,
    geocodeIsFetching: PropTypes.bool,
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

  componentDidMount() {
    const { route } = this.props;

    // our app state was hydrated with route data, get the elevation data
    if (route.response && route.response.downsampled) {
      this.getElevationData(route.response.downsampled);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { geocodeResult, startLocation, endLocation, route } = nextProps;

    if (geocodeResult && !isEqual(geocodeResult, this.props.geocodeResult)) {
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

    // we successfully retrieved a route, now get elevation data
    if (route.response && route.response.downsampled &&
      !isEqual(route.response, this.props.route.response)) {
      this.getElevationData(route.response.downsampled);
    }
  }

  getElevationData(downsampled) {
    const path = downsampled.map((feature) => {
      const { coordinates } = feature;
      return {
        lat: coordinates[1],
        lng: coordinates[0]
      };
    });

    this.props.fetchElevationData(path);
  }

  getRoute(startLocation, endLocation) {
    const self = this;
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
      route => self.props.routeSearchSuccess(route),
      error => self.props.routeSearchError(error)
    );
  }

  handleGeocodeResult(result) {
    const { coordinates } = result;
    const { startLocation, endLocation, nearestSegmentRequest } = this.props;
    const self = this;

    if (!coordinates || !coordinates.length) return;

    // if no start location has been set then get the nearest ECG segment,
    // and we'll call that the start location
    if (!startLocation.accepted && !endLocation.accepted) {
      const lat = coordinates[0];
      const lng = coordinates[1];

      nearestSegmentRequest('START');

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

      nearestSegmentRequest('END');

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

  renderSearchResultsStep() {
    // handles which step of the Search UX Flow to display using application state
    const { geocodeError, geocodeResult, geocodeIsFetching, startLocation,
      endLocation, acceptRoutingLocation, route } = this.props;

    if (geocodeIsFetching || startLocation.isFetching || endLocation.isFetching) {
      return <LoadingMsg message={'Searching...'} />;
    }

    if (geocodeError) {
      return <ErrorMsg error={geocodeError} />;
    }

    if (startLocation.distance && !startLocation.accepted) {
      return <StartLocationOptions {...{ geocodeResult, startLocation, acceptRoutingLocation }} />;
    }

    if (startLocation.accepted && !endLocation.coordinates.length) {
      return <StartLocationAcceptedOptions />;
    }

    if (endLocation.coordinates.length && !endLocation.accepted) {
      return <EndLocationOptions {...{ endLocation, geocodeResult, acceptRoutingLocation }} />;
    }

    if (endLocation.accepted && startLocation.accepted) {
      return <EndLocationAcceptedOptions {...{ route }} />;
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
