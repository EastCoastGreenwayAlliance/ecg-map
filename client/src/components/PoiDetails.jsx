import React, { Component } from 'react';
import PropTypes from 'prop-types';

class PoiDetails extends Component {
  static propTypes = {
    pois: PropTypes.object.isRequired,
    selectPoi: PropTypes.func.isRequired,
  }

  deselectPoi () {
    const { selectPoi } = this.props;
    selectPoi(null);
  }

  render () {
    const { selected } = this.props.pois;

    // if we have no POI then just return no UI at all
    if (!selected) return null;

    return (
      <div className="PoiDetails">
        <span className="close" onClick={() => this.deselectPoi()}>&times;</span>
        <h2>{ selected.name }</h2>
        <p>{ selected.description }</p>
      </div>
    );
  }
}

export default PoiDetails;
