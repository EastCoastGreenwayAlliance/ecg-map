import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import queryString from 'query-string';

import { parseQueryParams } from '../common/api';

// import components
// note that most of these are connected components, from 'containers/' dir
import NavBar from '../components/NavBar';
import SearchBox from '../components/SearchBox';
import DownloadSharePrintConnected from '../containers/DownloadSharePrintConnected';
import StartRouteViewCuesConnected from '../containers/StartRouteViewCuesConnected';
import ElevationProfileConnected from '../containers/ElevationProfileConnected';
import LeafletMapConnected from '../containers/LeafletMapConnected';
import ActiveTurningReadoutConnected from '../containers/ActiveTurningReadoutConnected';
import ModalContent from '../components/Modal';

/** Class that composes components to be shown on the default view / homepage
    This component also handles:
    - storing the map zoom and center in the URL hash
    - opening and closing of the Modal
*/
class Home extends Component {
  static propTypes = {
    history: PropTypes.object, // via react-router
    location: PropTypes.object, // via react-router
    match: PropTypes.object, // via react-router
    staticContext: PropTypes.object, // via react-router
    isMobile: PropTypes.bool, // via redux-responsive
    mailchimp: PropTypes.object, // mailchimp POST status
    postMailchimpAPI: PropTypes.func.isRequired, // action creator for POSTing to mailchip
    startLocation: PropTypes.object.isRequired,
    endLocation: PropTypes.object.isRequired,
  }

  constructor() {
    super();
    this.state = {
      showModal: true,
    };
    this.updateHash = this.updateHash.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { startLocation } = prevProps;

    if (startLocation.accepted && !this.props.startLocation.accepted) {
      const latLngZoom = parseQueryParams().loc;
      this.updateHash(...latLngZoom);
    }
  }

  updateHash(zoom, lat, lng) {
    // partial application state is stored in the URL hash & search
    // LeafletMap's center coordinates & zoom level are stored in the hash
    // start and/or end location are stored as query / search params
    const { history, startLocation, endLocation } = this.props;
    const params = {};
    params.route = [];
    params.loc = [];

    if (startLocation.accepted) {
      const coordsStart = startLocation.coordinates.map(coord => coord.toFixed(5));
      params.route = params.route.concat(coordsStart);
    }

    if (endLocation.accepted) {
      const coordsEnd = endLocation.coordinates.map(coord => coord.toFixed(5));
      params.route = params.route.concat(coordsEnd);
    }

    if (params.route.length) {
      params.route = params.route.join(',');
    } else {
      params.route = null;
    }

    params.loc = [zoom, lat.toFixed(5), lng.toFixed(5)].join(',');

    const search = queryString.stringify(params, { encode: false });

    history.push({
      search,
    });
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }

  render() {
    const { showModal } = this.state;
    const { isMobile, mailchimp, postMailchimpAPI } = this.props;

    return (
      <div className="Home">
        <NavBar {...{ isMobile }} />
        <SearchBox />
        <DownloadSharePrintConnected />
        <ElevationProfileConnected />
        <ActiveTurningReadoutConnected />
        <StartRouteViewCuesConnected {...{ isMobile }} />
        <LeafletMapConnected
          lat={36.897}
          lng={-74.619}
          zoom={5}
          onMapMove={this.updateHash}
        />
        <ReactModal
          isOpen={showModal}
          onRequestClose={this.handleCloseModal}
          contentLabel="Welcome to the East Coast Greenway!"
          className="Modal"
          overlayClassName="ModalOverlay"
        >
          <ModalContent
            handleCloseModal={this.handleCloseModal}
            handleFormSubmit={postMailchimpAPI}
            mailchimpResponse={mailchimp.text}
            mailchimpError={mailchimp.error}
          />
        </ReactModal>
      </div>
    );
  }
}

export default Home;
