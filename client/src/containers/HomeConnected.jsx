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
