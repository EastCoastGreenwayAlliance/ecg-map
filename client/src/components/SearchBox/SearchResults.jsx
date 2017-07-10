import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

import { cartoUser, cartoTables } from '../../common/config';
import { loadGeoRouter } from '../../common/api';

// helper components
import LoadingMsg from '../LoadingMsg';
import ErrorMsg from '../ErrorMsg';
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
    geocodeIsFetching: PropTypes.bool,
    geocodeError: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    geocodeResult: PropTypes.object,
    isMobile: PropTypes.bool.isRequired,
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

  componentWillMount() {
    const { startLocation, endLocation } = this.props;

    // check for preloaded state with start and end locations, if they exist tell
    // the geoRouter to find a route between them asyc
    if (endLocation.accepted && endLocation.coordinates.length && startLocation.accepted
      && startLocation.coordinates.length) {
      this.getRoute(startLocation, endLocation);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { geocodeResult, startLocation, endLocation } = nextProps;

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
  }

  // shouldComponentUpdate(nextProps) {
  //   // only re-render the search box when certain parts change
  //   // this could probably be more specific, where objects are being compared
  //   const { geocodeIsFetching, geocodeError, geocodeResult, endLocation,
  //     startLocation, route } = nextProps;
  //
  //   debugger;
  //
  //   if (geocodeIsFetching !== this.props.geocodeIsFetching ||
  //     !isEqual(geocodeError, this.props.geocodeError) ||
  //     !isEqual(geocodeResult, this.props.geocodeResult) ||
  //     !isEqual(endLocation, this.props.endLocation) ||
  //     !isEqual(startLocation, this.props.startLocation ||
  //     !isEqual(route.response, this.props.route.response) ||
  //     !isEqual(route.error, this.props.route.error) ||
  //     route.isLoadingRoute !== this.props.route.isLoadingRoute)
  //     ) {
  //     return true;
  //   }
  //
  //   return false;
  // }

  getRoute(startLocation, endLocation) {
    // handles making the geo routing search request given start and end locations
    const self = this;

    function findEcgRoute() {
      // make the findRoute call from our geoRouter, passing coordinates for
      // start and end locations, and callbacks for success and error
      self.geoRouter.findRoute(
        startLocation.coordinates[0],
        startLocation.coordinates[1],
        endLocation.coordinates[0],
        endLocation.coordinates[1],
        route => self.props.routeSearchSuccess(route),
        error => self.props.routeSearchError(error)
      );
    }

    // tell our app we are starting the search for a geo route
    this.props.routeSearchRequest();

    if (!this.geoRouter) {
      // import geoRouter codebase async
      loadGeoRouter((error, response) => {
        if (error) throw error;
        self.geoRouter = response.default;
        self.geoRouter.init(cartoUser, cartoTables.route_segments);
        findEcgRoute();
      });
    } else {
      // geo-router is already loaded
      findEcgRoute();
    }
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

      // tell our app we are "fetching" the nearest ECG segment node, as its
      // an async request & sometimes the routing calc takes a while
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

      // tell our app we are "fetching" the nearest ECG segment node, as its
      // an async request & sometimes the routing calc takes a while
      nearestSegmentRequest('END');

      this.geoRouter.findNearestSegmentToLatLng(lat, lng,
        closestSegment => self.handleGeoRoutingSuccess(closestSegment, 'END'),
        error => self.handleGeoRoutingError(error),
        {
          trailonly: true
        }
      );
    }
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
    const { geocodeError, geocodeResult, geocodeIsFetching, isMobile, startLocation,
      endLocation, acceptRoutingLocation, route } = this.props;

    if (geocodeIsFetching || startLocation.isFetching || endLocation.isFetching) {
      // loading message for when location is being searched
      return <LoadingMsg message={'Searching...'} />;
    }

    if (geocodeError) {
      // geocode error message
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

    if (!isMobile && endLocation.accepted && startLocation.accepted) {
      // also handles showing the route loading & error messages for desktop
      return <EndLocationAcceptedOptions {...{ route }} />;
    }

    if (isMobile && route.isLoadingRoute) {
      // handles showing the route loading msg for mobile
      return <LoadingMsg message={'Calculating route...'} />;
    }

    if (isMobile && route.error) {
      // handles showing the route error msg for mobile
      return <ErrorMsg error={route.error} />;
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
