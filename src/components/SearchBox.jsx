import React, { Component } from 'react';
import PropTypes from 'prop-types';

class SearchBox extends Component {
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
      this.setState({
        searchAddress: ''
      });
    }
  }

  render() {
    const { searchAddress } = this.state;

    return (
      <form className="SearchBox" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Search a Starting Point"
          value={searchAddress}
          onChange={this.handleChange}
        />
      </form>
    );
  }
}

export default SearchBox;
