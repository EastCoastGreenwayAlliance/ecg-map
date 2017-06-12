import { connect } from 'react-redux';

import LeafletMap from '../components/LeafletMap';

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

export default connect(mapStateToProps, null)(LeafletMap);
