import React, { Component } from 'react';
import PropTypes from 'prop-types';

class AlertPoiDetails extends Component {
  static propTypes = {
    alertpoi: PropTypes.object.isRequired,
    selectAlertPoint: PropTypes.func.isRequired,
  }

  deselectPoi () {
    const { selectAlertPoint } = this.props;
    selectAlertPoint(null);
  }

  render () {
    const { poi } = this.props.alertpoi;

    // if we have no POI then just return no UI at all
    if (!poi) return null;

    return (
      <div className="AlertPoiDetails">
        <span className="close" onClick={() => this.deselectPoi()}>&times;</span>
        <h2>{ poi.name }</h2>
        <p>{ poi.description }</p>
      </div>
    );
  }
}

export default AlertPoiDetails;
