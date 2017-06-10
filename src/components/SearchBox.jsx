import React, { Component } from 'react';
import PropTypes from 'prop-types';

class SearchBox extends Component {
  static propTypes = {
    fetchLocationGeocode: PropTypes.func,
    geocodeResult: PropTypes.object,
    geocodeError: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
  }

  constructor() {
    super();
    this.state = {
      searchAddress: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({
      searchAddress: e.target.value
    });
  }

  handleSubmit(e) {
    const { searchAddress } = this.state;
    e.preventDefault();

    if (searchAddress && searchAddress.length) {
      this.props.fetchLocationGeocode(searchAddress);
      this.setState({
        searchAddress: ''
      });
    }
  }

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
    const { searchAddress } = this.state;
    const { geocodeError } = this.props;

    return (
      <div className="SearchBox">
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            placeholder="Search a Starting Point"
            value={searchAddress}
            onChange={this.handleChange}
          />
        </form>
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

export default SearchBox;
