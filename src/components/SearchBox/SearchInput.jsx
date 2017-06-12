import React, { Component } from 'react';
import PropTypes from 'prop-types';

/** Class that handles location search */
class SearchInput extends Component {
  static propTypes = {
    fetchLocationGeocode: PropTypes.func,
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
    }
  }

  render() {
    const { searchAddress } = this.state;

    return (
      <div className="SearchInput">
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            placeholder="Search a Starting Point"
            value={searchAddress}
            onChange={this.handleChange}
          />
        </form>
      </div>
    );
  }
}

export default SearchInput;
