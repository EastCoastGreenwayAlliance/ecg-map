// Connects the part of the application state with the Home component
// see http://redux.js.org/docs/basics/UsageWithReact.html
import { connect } from 'react-redux';

import Home from '../views/Home';

const mapStateToProps = state => ({
  isMobile: !state.browser.greaterThan.medium,
  startLocation: state.routing.startLocation,
  endLocation: state.routing.endLocation,
});

export default connect(mapStateToProps, {
})(Home);
