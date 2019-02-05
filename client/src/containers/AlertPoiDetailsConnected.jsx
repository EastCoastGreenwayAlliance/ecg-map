import { connect } from 'react-redux';

import AlertPoiDetails from '../components/AlertPoiDetails';
import { selectAlertPoint } from '../actions';

const mapStateToProps = ({ alertpoi }) => ({
  alertpoi,
  selectAlertPoint,
});

export default connect(mapStateToProps, {
  selectAlertPoint,
})(AlertPoiDetails);
