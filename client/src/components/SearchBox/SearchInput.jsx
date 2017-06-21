import React, { Component } from 'react';
import PropTypes from 'prop-types';

/** Class that handles location search */
class SearchInput extends Component {
  static propTypes = {
    fetchLocationGeocode: PropTypes.func,
    cancelRoutingLocation: PropTypes.func,
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
    const { startLocation, endLocation } = nextProps;

    // if user accepted a starting or ending location, clear our searchAddres state
    if (
        (startLocation.accepted && !this.props.startLocation.accepted) ||
        (endLocation.accepted && !this.props.endLocation.accepted)
      ) {
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
    const { startLocation, endLocation, fetchLocationGeocode,
      cancelRoutingLocation } = this.props;
    e.preventDefault();

    // temporary logic to start over, this should be moved elsewhere
    if (startLocation.accepted && endLocation.accepted) {
      cancelRoutingLocation('DONE');
    }

    if (searchAddress && searchAddress.length) {
      fetchLocationGeocode(searchAddress);
    }
  }

  renderPlaceholderText() {
    const { startLocation, endLocation } = this.props;
    let text = '';

    if (!startLocation.accepted && !endLocation.accepted) text = 'Search a Starting Point';
    if (startLocation.accepted && !endLocation.accepted) text = 'Search a Ending Point';
    if (startLocation.accepted && endLocation.accepted) text = 'Search Again';

    return text;
  }

  render() {
    const { searchAddress } = this.state;

    return (
      <div className="SearchInput">
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            placeholder={this.renderPlaceholderText()}
            value={searchAddress}
            onChange={this.handleChange}
          />
        </form>
      </div>
    );
  }
}

export default SearchInput;
