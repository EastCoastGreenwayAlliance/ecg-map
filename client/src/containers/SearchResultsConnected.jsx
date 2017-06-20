import { connect } from 'react-redux';

import SearchResults from '../components/SearchBox/SearchResults';
import {
  nearestSegmentError,
  setRoutingLocation,
  acceptRoutingLocation,
  cancelRoutingLocation,
  routeSearchRequest,
  routeSearchSuccess,
  routeSearchError,
} from '../actions';

const mapStateToProps = ({ geocoding, routing }) => {
  const { error, result } = geocoding;
  const { endLocation, startLocation, route } = routing;
  return {
    geocodeError: error,
    geocodeResult: result,
    endLocation,
    startLocation,
    route
  };
};

export default connect(mapStateToProps, {
  nearestSegmentError,
  setRoutingLocation,
  acceptRoutingLocation,
  cancelRoutingLocation,
  routeSearchRequest,
  routeSearchSuccess,
  routeSearchError,
})(SearchResults);
