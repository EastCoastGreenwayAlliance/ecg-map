import React, { Component } from 'react';
import PropTypes from 'prop-types';

class PoiDetails extends Component {
  static propTypes = {
    selectedpoi: PropTypes.object.isRequired,
    selectPoi: PropTypes.func.isRequired,
  }

  deselectPoi () {
    const { selectPoi } = this.props;
    selectPoi(null);
  }

  render () {
    const { poi } = this.props.selectedpoi;

    // if we have no POI then just return no UI at all
    if (!poi) return null;

    return (
      <div className="PoiDetails">
        <span className="close" onClick={() => this.deselectPoi()}>&times;</span>
        <h2>{ poi.name }</h2>
        <p>{ poi.description }</p>
      </div>
    );
  }
}

export default PoiDetails;
