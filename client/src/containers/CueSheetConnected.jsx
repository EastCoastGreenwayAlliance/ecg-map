// Connects the part of the application state with the CueSheet component
// see http://redux.js.org/docs/basics/UsageWithReact.html
import { connect } from 'react-redux';

import CueSheet from '../views/CueSheet';

const mapStateToProps = ({ browser, routing }) => ({
  isMobile: !browser.greaterThan.small,
  route: routing.route
});

export default connect(mapStateToProps, null)(CueSheet);
