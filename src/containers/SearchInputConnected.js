import { connect } from 'react-redux';

import SearchInput from '../components/SearchBox/SearchInput';
import {
  fetchLocationGeocode,
  setRoutingLocation,
  acceptRoutingLocation,
  cancelRoutingLocation,
} from '../actions/';

const mapStateToProps = ({ routing }) => {
  const { startLocation, endLocation } = routing;
  return {
    startLocation,
    endLocation,
  };
};

/** Connects the SearchBox to the Redux store & action creator functions */
export default connect(mapStateToProps, {
  fetchLocationGeocode,
  setRoutingLocation,
  acceptRoutingLocation,
  cancelRoutingLocation,
})(SearchInput);
