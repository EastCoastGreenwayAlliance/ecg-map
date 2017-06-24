import { connect } from 'react-redux';

import CueSheet from '../views/CueSheet';

const mapStateToProps = ({ browser, routing }) => ({
  isMobile: !browser.greaterThan.small,
  route: routing.route
});

export default connect(mapStateToProps, null)(CueSheet);
