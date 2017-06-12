import { connect } from 'react-redux';

import SearchBox from '../components/SearchBox';
import {
  fetchLocationGeocode,
  setRoutingLocation,
  acceptRoutingLocation,
  cancelRoutingLocation,
} from '../actions/';

/** Connects the SearchBox to the Redux store & action creator functions */
export default connect(null, {
  fetchLocationGeocode,
  setRoutingLocation,
  acceptRoutingLocation,
  cancelRoutingLocation,
})(SearchBox);
