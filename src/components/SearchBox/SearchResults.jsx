import React, { Component } from 'react';
import PropTypes from 'prop-types';

/** Class that handles displaying location search results & geo-routing results */
class SearchResults extends Component {
  static propTypes = {
    geocodeError: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    geocodeResult: PropTypes.object,
  }

  // componentWillReceiveProps(nextProps) {
  //   const {  }
  // }

  handleGeocodeError() {
    const { geocodeError } = this.props;

    if (typeof geocodeError === 'string') {
      return geocodeError;
    }

    if (typeof geocodeError === 'object') {
      return geocodeError.message ?
        `${geocodeError.message}, please try again.` :
        'Something went wrong, please try again.';
    }
  }

  render() {
    const { geocodeError } = this.props;

    return (
      <div className="SearchResults">
        {
          geocodeError &&
          <div className="searchbox__error-msg">
            { this.handleGeocodeError() }
          </div>
        }
      </div>
    );
  }
}

export default SearchResults;
