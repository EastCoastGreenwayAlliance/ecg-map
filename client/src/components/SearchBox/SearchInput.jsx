import React, { Component } from 'react';
import PropTypes from 'prop-types';

/** Class for displaying the Location Search text input and firing geocoding API
    requests upon a search */
class SearchInput extends Component {
  static propTypes = {
    fetchLocationGeocode: PropTypes.func.isRequired,
    cancelRoutingLocation: PropTypes.func.isRequired,
    startLocation: PropTypes.object,
    endLocation: PropTypes.object,
    elevationDataClear: PropTypes.func.isRequired,
  }

  constructor() {
    super();
    this.state = {
      searchAddress: ''
    };
    this.textInput = null; // ref to the text input
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
      cancelRoutingLocation, elevationDataClear } = this.props;
    e.preventDefault();

    // unfocus the text input, closes keyboard on iOS devices
    this.textInput.blur();

    // temporary logic to start over, perhaps this should be moved elsewhere?
    if (startLocation.accepted && endLocation.accepted) {
      cancelRoutingLocation('DONE');
      elevationDataClear();
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
            ref={(_) => { this.textInput = _; }}
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
