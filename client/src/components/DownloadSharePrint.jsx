import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import isEqual from 'lodash/isEqual';
import Clipboard from 'clipboard';

import { loadToGPX, loadFileSaver } from '../common/api';
import {
  logCueSheetBtnClick,
  logDownloadGPX,
  logStatefulURLCopy
} from '../common/googleAnalytics';

const GPX_CREATOR_NAME = 'East Coast Greenway Map';
const GPX_TRACK_NAME = 'Route';
const GPX_TRACK_DESC = '';

/** Class that displays UI and handles:
    - creation and download of GPX file from route.response
    - sharing of route via stateful URL (TODO)
    - linking to cuesheet view
*/
class DownloadSharePrint extends Component {
  static propTypes = {
    startLocation: PropTypes.object,
    endLocation: PropTypes.object,
    route: PropTypes.object,
    isMobile: PropTypes.bool.isRequired,
  }

  constructor() {
    super();
    this.state = {
      gpx: null,
      error: null,
    };
    this.togpx = null;
    this.fileSaver = null;
  }

  componentDidMount() {
    // enable copying of the URL to the user's clipboard
    if (Clipboard.isSupported()) {
      const copyFail = () => {
        alert('Your browser doesn\'t support copying with a button.');
      };

      const copySuccess = () => {
        alert('Route search copied! Feel free to paste and share.');
        // log the copy event
        logStatefulURLCopy();
      };

      new Clipboard('button.dps-share', {
        text: () => window.location.href
      })
      .on('success', copySuccess)
      .on('error', copyFail);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { gpx } = prevState;

    // we have GPX data, create the blob and tell the browser to download it
    if (this.state.gpx && !isEqual(this.state.gpx, gpx)) {
      this.downloadGPXFile(this.state.gpx);
    }
  }

  convertToGPX(routeData) {
    const self = this;
    const geojson = { ...routeData };
    let gpx;
    let gpxConversionError;

    // we don't need the downsampled route data, so remove it
    delete geojson.downsampled;

    // merge the numerous features (linestrings, steps in the directions) into one giant feature
    // some GPS software treats each "trk" as a separate route / tour, and we want one big "trk"
    const theonepath = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiLineString',
        coordinates: [],
      },
    };

    geojson.features.forEach((feature) => {
      theonepath.geometry.coordinates.push(feature.geometry.coordinates.slice());
    });

    geojson.features = [theonepath];

    function featureTitle() {  // callback to set each feature's <name>
      return GPX_TRACK_NAME;  // we only have the 1 feature and it's just "Route"
      // return feature.properties.name;
    }

    function featureDescription() {  // callback to set each feature's <desc>
      return GPX_TRACK_DESC;  // we only have the 1 feature and it's just "Route"
      // return feature.transition.title;
    }

    // converts the GeoJSON response to a GPX string
    // sets component state with the gpx response and/or error
    function gpxConversion() {
      try {
        gpx = self.togpx(geojson, {
          creator: GPX_CREATOR_NAME,
          featureTitle,
          featureDescription,
        });
      } catch (e) {
        gpxConversionError = e;
        throw e;
      }

      self.setState({
        gpx,
        error: gpxConversionError,
      });
    }

    // dynamically imports "togpx.js" library if it hasn't been imported already
    if (!this.togpx) {
      loadToGPX((error, response) => {
        if (error) throw error;
        this.togpx = response;
        gpxConversion();
      });
    } else {
      gpxConversion();
    }
  }

  downloadGPXFile(gpxString) {
    // creates a Blob for the GPX string and downloads it to the user's computer
    const self = this;

    function saveFile() {
      const blob = new Blob([gpxString], { type: 'text/plain;charset=utf-8' });
      self.fileSaver.saveAs(blob, 'my-ecg-route.gpx');

      // record the GPX download event
      logDownloadGPX();
    }

    // dynamically imports "file-saver.js" library if it hasn't been imported already
    if (!this.fileSaver) {
      loadFileSaver((error, response) => {
        if (error) throw error;
        self.fileSaver = response;
        saveFile();
      });
    } else {
      saveFile();
    }
  }

  render() {
    const { route, isMobile } = this.props;

    if (!route.response || !route.response.features) return null;

    // don't show this component on mobile, it isn't useful & takes up space
    if (isMobile) return null;

    return (
      <div className="DownloadSharePrint">
        <button
          className="dps-download"
          title="Download GPX file"
          tabIndex={0}
          onClick={() => this.convertToGPX(route.response)}
        >
          <span />
        </button>
        <button
          className="dps-share"
          title="Copy URL"
          tabIndex={0}
          onClick={() => {}}
        >
          <span />
        </button>
        <Link to={'/cuesheet'}>
          <button
            className="dps-print"
            title="Print or View Cuesheet"
            tabIndex={0}
            onClick={() => logCueSheetBtnClick()}
          >
            <span />
          </button>
        </Link>
      </div>
    );
  }
}

export default DownloadSharePrint;
