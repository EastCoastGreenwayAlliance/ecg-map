import 'babel-polyfill';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// import components
import NavBar from '../components/NavBar';
import SearchBox from '../components/SearchBox';
import LeafletMap from '../components/LeafletMap';

class App extends Component {
  static propTypes = {
    history: PropTypes.object, // via react-router
    location: PropTypes.object, // via react-router
    match: PropTypes.object, // via react-router
    staticContext: PropTypes.object, // via react-router
  }

  constructor() {
    super();
    this.updateHash = this.updateHash.bind(this);
  }

  updateHash(lat, lng, zoom) {
    const { history } = this.props;
    history.push({
      hash: `#${zoom}/${lat}/${lng}`
    });
  }

  render() {
    return (
      <div className="App">
        <NavBar />
        <SearchBox />
        <LeafletMap
          lat={36.897}
          lng={-74.619}
          zoom={5}
          onMapMove={this.updateHash}
        />
      </div>
    );
  }
}

export default App;
