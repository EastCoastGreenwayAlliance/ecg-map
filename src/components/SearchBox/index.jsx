import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SearchInput from './SearchInput';
import SearchResults from './SearchResults';

/** Class that houses the Location Search & GeoRouting results */
class SearchBox extends Component {
  static propTypes = {
    fetchLocationGeocode: PropTypes.func,
    geocodeResult: PropTypes.object,
    geocodeError: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
  }

  render() {
    const { fetchLocationGeocode, geocodeResult, geocodeError } = this.props;

    return (
      <div className="SearchBox">
        <SearchInput {...{ fetchLocationGeocode }} />
        <SearchResults
          {...{ geocodeResult, geocodeError }}
        />
      </div>
    );
  }
}

export default SearchBox;
