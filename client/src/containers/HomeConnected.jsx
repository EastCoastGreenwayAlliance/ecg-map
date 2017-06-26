// Connects the part of the application state with the Home component
// see http://redux.js.org/docs/basics/UsageWithReact.html
import { connect } from 'react-redux';

import { postMailchimpAPI } from '../actions';
import Home from '../views/Home';

const mapStateToProps = state => ({
  isMobile: !state.browser.greaterThan.small,
  mailchimp: state.mailchimp
});

export default connect(mapStateToProps, {
  postMailchimpAPI,
})(Home);
