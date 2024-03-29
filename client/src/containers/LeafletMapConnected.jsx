// Connects the part of the application state with the LeafletMap component
// see http://redux.js.org/docs/basics/UsageWithReact.html
import { connect } from 'react-redux';

import LeafletMap from '../components/LeafletMap';

import { updateActiveTurning, disableActiveTurning, reportLocationError, selectPoi, updateNearbyPois, fetchLocationGeocode, cancelRoutingLocation, acceptRoutingLocation, setMapZoomOnGeocode } from '../actions';

const mapStateToProps = ({ activeturning, browser, geocoding, routing }) => {
  const { enabled } = activeturning;
  const { greaterThan } = browser;
  const { error, result, zoomMapToGeocodes } = geocoding;
  const { startLocation, endLocation, route } = routing;

  return {
    activeTurningEnabled: enabled,
    geocodeError: error,
    geocodeResult: result,
    zoomMapToGeocodes,
    isMobile: !greaterThan.medium,
    startLocation,
    endLocation,
    route
  };
};

export default connect(mapStateToProps, {
  disableActiveTurning,
  updateActiveTurning,
  reportLocationError,
  selectPoi,
  updateNearbyPois,
  fetchLocationGeocode,
  cancelRoutingLocation,
  acceptRoutingLocation,
  setMapZoomOnGeocode,
})(LeafletMap);
