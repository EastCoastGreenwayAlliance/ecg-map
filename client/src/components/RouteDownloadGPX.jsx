import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { loadToGPX, loadFileSaver } from '../common/api';
import { logDownloadGPX } from '../common/googleAnalytics';

const GPX_CREATOR_NAME = 'East Coast Greenway Map';
const GPX_TRACK_NAME = 'Route';
const GPX_ROUTE_POINTS_NAME = 'Cues';

class RouteDownloadGPX extends Component {
  static propTypes = {
    route: PropTypes.object,
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

  exportRouteToGPX() {
    const { route } = this.props;
    const routegeojson = route.response;

    // two transforms on the data for GPX output
    // - merge the numerous linestring features (steps in the directions) into one giant feature
    // because some GPS software treats each "trk" as a separate route and this is one big line
    // - extract the the features' transitions (again, steps) into a list of points
    // these are the turn directions & points, and become <wpt> entries
    const exportgeojson = {
      type: 'FeatureCollection',
      features: [],
    };

    const turnpoints = routegeojson.features.map((feature) => {
      const it = {
        type: 'Feature',
        properties: {
          rte: true, // GreenInfo extension, this point is a rtept and not a wpt
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
        coordinates: routegeojson.features.reduce((collected, feature) => {
          collected.push(feature.geometry.coordinates.slice());
          return collected;
        }, []),
      },
    };

    const alertpois = routegeojson.properties.pois.map((poi) => {
      const it = {
        type: 'Feature',
        properties: {
          rte: false, // GreenInfo extension, this point is a wpt and not a rtept
          name: `${poi.type}: ${poi.name}`,
          description: poi.description,
        },
        geometry: {
          type: 'Point',
          coordinates: [poi.lng, poi.lat],
        },
      };
      return it;  // fool webpack into not complaining about returning in 1 statement
    });

    exportgeojson.features = turnpoints;
    exportgeojson.features = exportgeojson.features.concat(alertpois);
    exportgeojson.features.push(theonepath);

    // use togpx to return a GPX string representing the the GeoJSON document
    // sets component state with the gpx response and/or error
    function featureTitle(properties) {  // callback to set each feature's <name>
      return properties.name;
    }

    function featureDescription(properties) {  // callback to set each feature's <name>
      return properties.description;
    }

    loadToGPX((tgerror, togpx) => {
      if (tgerror) throw tgerror;

      try {
        const gpxstring = togpx(exportgeojson, {
          creator: GPX_CREATOR_NAME,
          featureTitle,
          featureDescription,
          rteName: GPX_ROUTE_POINTS_NAME,
        });

        loadFileSaver((fserror, fileSaver) => {
          if (fserror) throw fserror;

          const blob = new Blob([gpxstring], { type: 'text/plain;charset=utf-8' });
          fileSaver.saveAs(blob, 'my-ecg-route.gpx');

          logDownloadGPX();
        });
      } catch (e) {
        console.error(e);  // eslint-disable-line no-console
      }
    });
  }

  render() {
    return (
      <button
        className="dps dps-download-gpx"
        title="Download GPX file"
        tabIndex={0}
        onClick={() => this.exportRouteToGPX()}
      >
        <span />
      </button>
    );
  }
}

export default RouteDownloadGPX;
