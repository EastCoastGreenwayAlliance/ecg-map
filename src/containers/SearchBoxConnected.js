import { connect } from 'react-redux';

import SearchBox from '../components/SearchBox';
import { fetchLocationGeocode } from '../actions/';

// const mapStateToProps = ({ geocoding }) => {
//   const { error, isFetching, result, searchTerm } = geocoding;
//   return {
//     geocodeError: error,
//     isFetching,
//     result,
//     searchTerm,
//   };
// };

export default connect(null, {
  fetchLocationGeocode,
})(SearchBox);
