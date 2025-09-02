import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { loadFileSaver } from '../common/api';
import { logDownloadTCX } from '../common/googleAnalytics';

const CUE_POINT_CODES = { // CueSheet.jsx turn codes => TCX PointType
  AR: 'Danger',
  RT: 'Right',
  RH: 'Right',
  RS: 'Right',
  LT: 'Left',
  LH: 'Left',
  LS: 'Left',
  ST: 'Straight',
};

class RouteDownloadTCX extends Component {
  static propTypes = {
    route: PropTypes.object,
    elevData: PropTypes.array,
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

  exportRouteToTCX() {
    const { route } = this.props;
    const { elevData } = this.props;
    const routegeojson = route.response;

    // take a copy of the elevation data which we will repeatedly sort & thrash below
    // we'll use these to find nearest elevation sample, so convert to L.LatLng
    const elevationpoints = elevData.map((elev) => {
      const it = {
        latlng: L.latLng([elev.location.lat(), elev.location.lng()]),
        elevation: elev.elevation,
      };
      return it;
    });

    // create a XML parser, then the top-level TrainingCenterDatabase item
    const namespace = 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2';
    const xsi = 'http://www.w3.org/2001/XMLSchema-instance';
    const loc = 'http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd';

    const xmlroot = (new DOMParser()).parseFromString('<root></root>', 'text/xml');
    const tcxmain = xmlroot.createElementNS(namespace, 'TrainingCenterDatabase');

    xmlroot.replaceChild(tcxmain, xmlroot.documentElement);

    tcxmain.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xsi', xsi);
    tcxmain.setAttributeNS(xsi, 'xsi:schemaLocation', `${namespace} ${loc}`);

    // just one folder with one course in it
    // Folders -> Courses -> CourseFolder -> CourseNameRef -> Id


    // a Courses set with only the one Course
    // Courses -> Course -> Track -> Trackpoint
    const courses = xmlroot.createElementNS(namespace, 'Courses');
    tcxmain.appendChild(courses);
    const course = xmlroot.createElementNS(namespace, 'Course');
    courses.appendChild(course);
    const course_name = xmlroot.createElementNS(namespace, 'Name');
    course_name.textContent = 'Route';
    course.appendChild(course_name);

    // the one Course has one Track, and the list of points along the track
    // Courses -> Course -> Track -> [Trackpoint, ...]
    // each trackpoint also has the meters traveled so far, which sounds similar to
    // Cumulative Distance on CueSheet except that's at each cue point, and this is at each vertex
    const course_track = xmlroot.createElementNS(namespace, 'Track');
    course.appendChild(course_track);

    const trackpoints = [];
    let cumulativeMeters = 0;

    routegeojson.features.forEach((feature) => {
      feature.geometry.coordinates.forEach((vertex, i) => {
        if (i > 0) {
          const prev = feature.geometry.coordinates[i - 1];
          const s0 = L.latLng(vertex[1], vertex[0]);
          const s1 = L.latLng(prev[1], prev[0]);
          const sm = s0.distanceTo(s1);
          cumulativeMeters += sm;
        }

        const thisone = {
          position_lat: vertex[1],
          position_lng: vertex[0],
          meterstraveled: cumulativeMeters,
          elevmeters: 0, // see below
        };

        // find the closest elevation sample point and use its elevation
        // the elevation points are Google LatLng; we want distanceTo so convert to L.LatLng
        const here = L.latLng([vertex[1], vertex[0]]);
        elevationpoints.sort((p, q) => {
          const d1 = here.distanceTo(p.latlng);
          const d2 = here.distanceTo(q.latlng);
          if (d1 === d2) return 0;
          return d1 < d2 ? -1 : 1;
        });
        thisone.elevmeters = elevationpoints[0].elevation;

        // done
        trackpoints.push(thisone);
      });
    });

    trackpoints.forEach((point) => {
      const trackpoint = xmlroot.createElementNS(namespace, 'Trackpoint');
      const trackpoint_pos = xmlroot.createElementNS(namespace, 'Position');
      const trackpoint_pos_lat = xmlroot.createElementNS(namespace, 'LatitudeDegrees');
      const trackpoint_pos_lng = xmlroot.createElementNS(namespace, 'LongitudeDegrees');
      const trackpoint_distance = xmlroot.createElementNS(namespace, 'DistanceMeters');
      const trackpoint_elevation = xmlroot.createElementNS(namespace, 'AltitudeMeters');

      trackpoint_pos_lat.textContent = point.position_lat;
      trackpoint_pos_lng.textContent = point.position_lng;
      trackpoint_distance.textContent = point.meterstraveled;
      trackpoint_elevation.textContent = point.elevmeters;

      trackpoint.appendChild(trackpoint_pos);
      trackpoint_pos.appendChild(trackpoint_pos_lat);
      trackpoint_pos.appendChild(trackpoint_pos_lng);
      trackpoint.appendChild(trackpoint_distance);
      trackpoint.appendChild(trackpoint_elevation);

      course_track.appendChild(trackpoint);
    });

    // CoursePoint are POIs e.g. turning and alert; Ride With GPS turns these into a cue sheet
    // Courses -> Course -> [CoursePoint, ...]
    // four parts here:
    // - each turning transition
    // - any alert POIs for each transition
    // - the route start
    // - the route end
    const cuepoints = [];

    routegeojson.features.forEach((feature) => {
      // add this turning direction as a cue
      const thisone = {
        name: feature.properties.transition.title,
        pointtype: CUE_POINT_CODES[feature.properties.transition.code] || 'Generic',
        notes: feature.properties.transition.title,
        position_lat: feature.properties.transition.lat,
        position_lng: feature.properties.transition.lng,
      };
      cuepoints.push(thisone);

      // alert POIs for this segment, also added as cues
      const alerts = routegeojson.properties.pois.filter(poi => poi.segmentid === feature.properties.id);  // eslint-disable-line
      alerts.forEach((poi) => {
        const thisonetoo = {
          name: poi.name,
          pointtype: CUE_POINT_CODES.AR,
          notes: poi.description,
          position_lat: poi.lat,
          position_lng: poi.lng,
        };
        cuepoints.push(thisonetoo);
      });
    });
    const cuefirstsegment = routegeojson.features[0].geometry;
    const cuefirstname = routegeojson.features[0].properties.title;
    cuepoints.unshift({
      name: `Start on ${cuefirstname}`,
      pointtype: 'Generic',
      notes: `Start on ${cuefirstname}`,
      position_lat: cuefirstsegment.coordinates[0][1],
      position_lng: cuefirstsegment.coordinates[0][0],
    });

    cuepoints.forEach((poi) => {
      const coursepoint = xmlroot.createElementNS(namespace, 'CoursePoint');
      const coursepoint_name = xmlroot.createElementNS(namespace, 'Name');
      const coursepoint_notes = xmlroot.createElementNS(namespace, 'Notes');
      const coursepoint_pointtype = xmlroot.createElementNS(namespace, 'PointType');
      const coursepoint_pos = xmlroot.createElementNS(namespace, 'Position');
      const coursepoint_pos_lat = xmlroot.createElementNS(namespace, 'LatitudeDegrees');
      const coursepoint_pos_lng = xmlroot.createElementNS(namespace, 'LongitudeDegrees');

      coursepoint_name.textContent = poi.name;
      coursepoint_notes.textContent = poi.notes;
      coursepoint_pointtype.textContent = poi.pointtype;
      coursepoint_pos_lat.textContent = poi.position_lat;
      coursepoint_pos_lng.textContent = poi.position_lng;

      course.appendChild(coursepoint);
      coursepoint_pos.appendChild(coursepoint_pos_lat);
      coursepoint_pos.appendChild(coursepoint_pos_lng);
      coursepoint.appendChild(coursepoint_name);
      coursepoint.appendChild(coursepoint_notes);
      coursepoint.appendChild(coursepoint_pointtype);
      coursepoint.appendChild(coursepoint_pos);
    });

    // done collecting the route and cue points into a XML structure
    // serialize as a string, then use FileSaver to download it
    // formatXML() courtesy of sam hocevar https://jsfiddle.net/fbn5j7ya/ https://stackoverflow.com/a/49458964
    function formatXML(xml, tab = '  ', nl = '\n') {
      let formatted = '', indent = ''; // eslint-disable-line
      const nodes = xml.slice(1, -1).split(/>\s*</);
      if (nodes[0][0] == '?') formatted += '<' + nodes.shift() + '>' + nl; // eslint-disable-line
      for (let i = 0; i < nodes.length; i++) { // eslint-disable-line
        const node = nodes[i];
        if (node[0] === '/') indent = indent.slice(tab.length); // decrease indent
        formatted += indent + '<' + node + '>' + nl; // eslint-disable-line
        if (node[0] !== '/' && node[node.length - 1] !== '/' && node.indexOf('</') === -1) indent += tab; // increase indent
      }
      return formatted;
    }

    try {
      const xmlheader = '<?xml version="1.0" encoding="UTF-8"?>';
      const xmlbody = (new XMLSerializer()).serializeToString(tcxmain);
      const xmlstring = formatXML(`${xmlheader}\n${xmlbody}`);

      loadFileSaver((fserror, fileSaver) => {
        if (fserror) throw fserror;
        const blob = new Blob([xmlstring], { type: 'text/xml;charset=utf-8' });
        fileSaver.saveAs(blob, 'my-ecg-route.tcx');
        logDownloadTCX();
      });
    } catch (e) {
      console.error(e);  // eslint-disable-line no-console
    }
  }

  render() {
    return (
      <button
        className="dps dps-download-tcx"
        title="Download TCX file"
        tabIndex={0}
        onClick={() => this.exportRouteToTCX()}
      >
        <span />
      </button>
    );
  }
}

export default RouteDownloadTCX;
