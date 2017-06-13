import React, { Component } from 'react';
import PropTypes from 'prop-types';

/** Class that handles location search */
class SearchInput extends Component {
  static propTypes = {
    fetchLocationGeocode: PropTypes.func,
    startLocation: PropTypes.object,
    endLocation: PropTypes.object,
  }

  constructor() {
    super();
    this.state = {
      searchAddress: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { startLocation } = nextProps;

    // if user accepted a starting location
    if (startLocation.accepted && !this.props.startLocation.accepted) {
      // change the placeholder text
      this.setState({ searchAddress: '' });
    }
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
    const { startLocation } = this.props;
    const placeholderText = !startLocation.accepted ? 'Search a Starting Point' : 'Search a Ending Point';

    return (
      <div className="SearchInput">
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            placeholder={placeholderText}
            value={searchAddress}
            onChange={this.handleChange}
          />
        </form>
      </div>
    );
  }
}

export default SearchInput;
