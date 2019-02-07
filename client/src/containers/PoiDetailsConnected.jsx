import { connect } from 'react-redux';

import PoiDetails from '../components/PoiDetails';
import { selectPoi } from '../actions';

const mapStateToProps = ({ selectedpoi }) => ({
  selectedpoi,
  selectPoi,
});

export default connect(mapStateToProps, {
  selectPoi,
})(PoiDetails);
