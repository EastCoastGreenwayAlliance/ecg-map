import 'babel-polyfill';
import React, { Component } from 'react';

// import components
import NavBar from './NavBar';
import LeafletMap from './LeafletMap';

class App extends Component {
  render() {
    return (
      <div className="App">
        <NavBar />
        <LeafletMap lat={36.897} lng={-74.619} zoom={5} />
      </div>
    );
  }
}

export default App;
