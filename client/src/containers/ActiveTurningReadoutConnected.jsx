import { connect } from 'react-redux';

import ActiveTurningReadout from '../components/ActiveTurningReadout';

// placeholder for when we need to massage the structure instead of keeping it as-is
const mapStateToProps = ({ activeturning }) => activeturning;

export default connect(mapStateToProps, null)(ActiveTurningReadout);
