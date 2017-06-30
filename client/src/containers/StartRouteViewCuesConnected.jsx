// Connects the part of the application state with the StartRouteViewCues component
// see http://redux.js.org/docs/basics/UsageWithReact.html
import { connect } from 'react-redux';

import StartRouteViewCues from '../components/StartRouteViewCues';

const mapStateToProps = ({ browser, routing }) => {
  const { greaterThan } = browser;
  const { startLocation, endLocation } = routing;

  return {
    isMobile: !greaterThan.small,
    startLocation,
    endLocation,
  };
};

export default connect(mapStateToProps, null)(StartRouteViewCues);
