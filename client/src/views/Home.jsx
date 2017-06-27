import 'babel-polyfill';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';

// import components
import NavBar from '../components/NavBar';
import SearchBox from '../components/SearchBox';
import DownloadSharePrintConnected from '../containers/DownloadSharePrintConnected';
import LeafletMapConnected from '../containers/LeafletMapConnected';
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
  }

  constructor() {
    super();
    this.state = {
      showModal: true,
    };
    this.updateHash = this.updateHash.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  updateHash(lat, lng, zoom) {
    const { history } = this.props;
    history.push({
      hash: `#${zoom}/${lat}/${lng}`
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
