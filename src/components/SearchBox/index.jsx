import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SearchInput from './SearchInput';
import SearchResultsConnected from '../../containers/SearchResultsConnected';

/** Class that houses the Location Search & GeoRouting results */
class SearchBox extends Component {
  static propTypes = {
    fetchLocationGeocode: PropTypes.func.isRequired,
  }

  render() {
    const { fetchLocationGeocode } = this.props;

    return (
      <div className="SearchBox">
        <SearchInput {...{ fetchLocationGeocode }} />
        <SearchResultsConnected />
      </div>
    );
  }
}

export default SearchBox;
