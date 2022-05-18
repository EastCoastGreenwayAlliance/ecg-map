import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { loadFileSaver } from '../common/api';
import { logDownloadTCX } from '../common/googleAnalytics';

const TCX_FOLDER_NAME = 'East Coast Greenway Map';
const TCX_ROUTE_NAME = 'Route';
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
    const routegeojson = route.response;

    // create a XML parser, then the top-level TrainingCenterDatabase item
    const xmlroot = (new DOMParser()).parseFromString('<root></root>', 'text/xml');

    const tcxmain = xmlroot.createElement('TrainingCenterDatabase');
    tcxmain.setAttribute('xmlns', 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2');
    tcxmain.setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
    tcxmain.setAttribute('xsi:schemaLocation', 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd');

    // just one folder with one course in it
    // Folders -> Courses -> CourseFolder -> CourseNameRef -> Id
    const folders = xmlroot.createElement('Folders');
    tcxmain.appendChild(folders);
    const folders_courses = xmlroot.createElement('Courses');
    const folders_csubfolder = xmlroot.createElement('CourseFolder');
    folders_csubfolder.setAttribute('Name', TCX_FOLDER_NAME);
    const folders_csubfolder_coursenameref = xmlroot.createElement('CourseNameRef');
    const folders_csubfolder_coursenameref_id = xmlroot.createElement('Id');
    folders_csubfolder_coursenameref_id.textContent = TCX_ROUTE_NAME;
    folders.appendChild(folders_courses);
    folders_courses.appendChild(folders_csubfolder);
    folders_csubfolder.appendChild(folders_csubfolder_coursenameref);
    folders_csubfolder_coursenameref.appendChild(folders_csubfolder_coursenameref_id);

    // a Courses set with only the one Course
    // Courses -> Course -> Track -> Trackpoint
    const courses = xmlroot.createElement('Courses');
    tcxmain.appendChild(courses);
    const course = xmlroot.createElement('Course');
    courses.appendChild(course);
    const course_name = xmlroot.createElement('Name');
    course_name.textContent = TCX_ROUTE_NAME;
    course.appendChild(course_name);

    // the one Course has one Track, and the list of points along the track
    // Courses -> Course -> Track -> [Trackpoint, ...]
    // each trackpoint also has the meters traveled so far, which sounds similar to
    // Cumulative Distance on CueSheet except that's at each cue point, and this is at each vertex
    const course_track = xmlroot.createElement('Track');
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
        };
        trackpoints.push(thisone);
      });
    });

    trackpoints.forEach((point) => {
      const trackpoint = xmlroot.createElement('Trackpoint');
      const trackpoint_pos = xmlroot.createElement('Position');
      const trackpoint_pos_lat = xmlroot.createElement('LatitudeDegrees');
      const trackpoint_pos_lng = xmlroot.createElement('LongitudeDegrees');
      const trackpoint_distance = xmlroot.createElement('DistanceMeters');

      trackpoint_pos_lat.textContent = point.position_lat;
      trackpoint_pos_lng.textContent = point.position_lng;
      trackpoint_distance.textContent = point.meterstraveled;

      trackpoint.appendChild(trackpoint_pos);
      trackpoint_pos.appendChild(trackpoint_pos_lat);
      trackpoint_pos.appendChild(trackpoint_pos_lng);
      trackpoint.appendChild(trackpoint_distance);

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
      const coursepoint = xmlroot.createElement('CoursePoint');
      const coursepoint_name = xmlroot.createElement('Name');
      const coursepoint_notes = xmlroot.createElement('Notes');
      const coursepoint_pointtype = xmlroot.createElement('PointType');
      const coursepoint_pos = xmlroot.createElement('Position');
      const coursepoint_pos_lat = xmlroot.createElement('LatitudeDegrees');
      const coursepoint_pos_lng = xmlroot.createElement('LongitudeDegrees');

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
