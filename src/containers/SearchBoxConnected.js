import { connect } from 'react-redux';

import SearchBox from '../components/SearchBox';
import { fetchLocationGeocode } from '../actions/';

const mapStateToProps = ({ geocoding }) => {
  const { error, result, searchTerm } = geocoding;
  return {
    geocodeError: error,
    geocodeResult: result,
    searchTerm,
  };
};

export default connect(mapStateToProps, {
  fetchLocationGeocode,
})(SearchBox);
