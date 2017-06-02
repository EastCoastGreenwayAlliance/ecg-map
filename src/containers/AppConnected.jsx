import { connect } from 'react-redux';

import App from '../views/App';

const mapStateToProps = state => ({
  isMobile: !state.browser.greaterThan.small
});

export default connect(mapStateToProps, null)(App);
