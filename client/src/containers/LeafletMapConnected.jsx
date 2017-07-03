// Connects the part of the application state with the LeafletMap component
// see http://redux.js.org/docs/basics/UsageWithReact.html
import { connect } from 'react-redux';

import LeafletMap from '../components/LeafletMap';

import { updateActiveTurning } from '../actions';

const mapStateToProps = ({ geocoding, routing }) => {
  const { error, result } = geocoding;
  const { startLocation, endLocation, route } = routing;

  return {
    geocodeError: error,
    geocodeResult: result,
    startLocation,
    endLocation,
    route
  };
};

export default connect(mapStateToProps, {
  updateActiveTurning,
})(LeafletMap);
