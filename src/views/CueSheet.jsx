import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import NavBar from '../components/NavBar';

class CueSheet extends Component {
  render() {
    return (
      <div className="CueSheet">
        <NavBar />
        <div className="cues-container">
          <h3>Cues</h3>
          <p>To do...</p>
          <p><Link to="/">Map</Link></p>
        </div>
      </div>
    );
  }
}

export default CueSheet;
