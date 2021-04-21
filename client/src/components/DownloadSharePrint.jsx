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

    // two transforms on the data for GPX output
    // - merge the numerous linestring features (steps in the directions) into one giant feature
    // because some GPS software treats each "trk" as a separate route and this is one big line
    // - extract the the features' transitions (again, steps) into a list of points
    // these are the turn directions & points, and become <wpt> entries

    const turnpoints = geojson.features.map((feature) => {
      const it = {
        type: 'Feature',
        properties: {
          name: feature.properties.transition.title,
          description: feature.properties.title,
        },
        geometry: {
          type: 'Point',
          coordinates: [feature.properties.transition.lng, feature.properties.transition.lat],
        },
      };
      return it;  // fool webpack into not complaining about returning in 1 statement
    });

    const theonepath = {
      type: 'Feature',
      properties: {
        name: GPX_TRACK_NAME,
        description: '',
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: geojson.features.reduce((collected, feature) => {
          collected.push(feature.geometry.coordinates.slice());
          return collected;
        }, []),
      },
    };

    geojson.features = turnpoints;
    geojson.features.push(theonepath);

    // use togpx to return a GPX string representing the the GeoJSON document
    // sets component state with the gpx response and/or error
    function featureTitle(properties) {  // callback to set each feature's <name>
      return properties.name;
    }

    function featureDescription(properties) {  // callback to set each feature's <name>
      return properties.description;
    }

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
