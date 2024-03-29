// Connects the part of the application state with the DownloadPrintShare component
// see http://redux.js.org/docs/basics/UsageWithReact.html
import { connect } from 'react-redux';

import DownloadSharePrint from '../components/DownloadSharePrint';

const mapStateToProps = ({ browser, routing, elevation }) => {
  const { startLocation, endLocation, route } = routing;
  const { greaterThan } = browser;

  return {
    startLocation,
    endLocation,
    route,
    isMobile: !greaterThan.medium,
    elevData: elevation.result,
  };
};

export default connect(mapStateToProps, null)(DownloadSharePrint);
