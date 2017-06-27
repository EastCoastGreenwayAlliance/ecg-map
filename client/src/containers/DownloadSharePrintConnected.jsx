// Connects the part of the application state with the DownloadPrintShare component
// see http://redux.js.org/docs/basics/UsageWithReact.html
import { connect } from 'react-redux';

import DownloadSharePrint from '../components/DownloadSharePrint';

const mapStateToProps = ({ routing }) => {
  const { startLocation, endLocation, route } = routing;

  return {
    startLocation,
    endLocation,
    route
  };
};

export default connect(mapStateToProps, null)(DownloadSharePrint);
