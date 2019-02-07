import { connect } from 'react-redux';

import PoiDetails from '../components/PoiDetails';
import { selectPoi } from '../actions';

const mapStateToProps = ({ pois }) => ({
  pois,
  selectPoi,
});

export default connect(mapStateToProps, {
  selectPoi,
})(PoiDetails);
