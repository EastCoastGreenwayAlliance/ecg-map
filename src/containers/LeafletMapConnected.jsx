import { connect } from 'react-redux';

import LeafletMap from '../components/LeafletMap';

const mapStateToProps = ({ geocoding }) => {
  const { error, result } = geocoding;

  return {
    geocodeError: error,
    geocodeResult: result,
  };
};

export default connect(mapStateToProps, null)(LeafletMap);
