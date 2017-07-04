import { connect } from 'react-redux';

import ActiveTurningReadout from '../components/ActiveTurningReadout';

const mapStateToProps = ({ activeturning }) => {
  return activeturning;
};

export default connect(mapStateToProps, null)(ActiveTurningReadout);
