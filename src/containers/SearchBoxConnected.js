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

/** Connects the SearchBox to the Redux store & action creator functions */
export default connect(mapStateToProps, {
  fetchLocationGeocode,
})(SearchBox);
