// Connects the part of the application state with the StartRouteViewCues component
// see http://redux.js.org/docs/basics/UsageWithReact.html
import { connect } from 'react-redux';

import StartRouteViewCues from '../components/StartRouteViewCues';
import { enableActiveTurning } from '../actions';

const mapStateToProps = ({ activeturning, browser, routing }) => {
  const { greaterThan } = browser;
  const { route } = routing;
  const { enabled } = activeturning;

  return {
    activeTurningEnabled: enabled,
    isMobile: !greaterThan.medium,
    route,
  };
};

export default connect(mapStateToProps, {
  enableActiveTurning,
})(StartRouteViewCues);
