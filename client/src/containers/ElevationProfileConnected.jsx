import { connect } from 'react-redux';

import { fetchElevationData } from '../actions';
import ElevationProfile from '../components/ElevationProfile';

const mapStateToProps = ({ activeturning, browser, elevation, routing }) => {
  const { enabled } = activeturning;
  const { greaterThan } = browser;
  const { result, error, isFetching } = elevation;
  const { route } = routing;

  return {
    activeTurningEnabled: enabled,
    isMobile: !greaterThan.small,
    elevData: result,
    route,
    error,
    isFetching,
  };
};

export default connect(mapStateToProps, {
  fetchElevationData,
})(ElevationProfile);
