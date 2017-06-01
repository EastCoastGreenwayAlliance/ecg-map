import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ModalContent extends Component {
  static propTypes = {
    handleCloseModal: PropTypes.func.isRequired,
  }

  constructor() {
    super();
    this.state = {
      email: '',
      valid: false,
      submitted: false,
    };
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleTextChange(event) {
    event.preventDefault();
    const value = event.target.value;

    // validate the user's email before we enable the form to be submitted
    if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
      this.setState({
        email: event.target.value,
        valid: true
      });
    } else {
      this.setState({
        email: event.target.value,
        valid: false
      });
    }
  }

  handleSubmit() {
    // event.preventDefault();
    this.setState({ submitted: true });
    this.props.handleCloseModal();
  }

  render() {
    const { handleCloseModal } = this.props;
    const { email, valid } = this.state;

    const buttonStyle = {
      background: valid ? '#65bf80' : 'hsl(0,0%,50%)',
      color: valid ? '#fff' : '#eee'
    };

    return (
      <div className="ModalContent">
        <button className="modal-content__close" onClick={() => handleCloseModal()}>×</button>
        <div className="modal-content__top-box">
          <h5 className="modal-content__greeting-copy">
            The East Coast Greenway is a 2,500 mile traffic free path linking east
            coast cities from Maine to Florida. Use this map to get to the Greenway
            and plan trips along it.
          </h5>
        </div>
        <div className="modal-content__bottom-box">
          <p className="signup-copy">Sign up to receive Greenway map, event, & program updates.</p>
          <form
            className="modal-content__signup-form"
            onSubmit={this.handleSubmit}
            action="https://greenway.us11.list-manage.com/subscribe/post"
            method="POST"
          >
            <input type="hidden" name="u" value="1912b94880f9bb2c2834cbcf6" />
            <input type="hidden" name="id" value="962cce34d4" />
            <input
              className="signup-input"
              type="email"
              name="MERGE0"
              id="MERGE0"
              autoCapitalize="off"
              autoCorrect="off"
              tabIndex={0}
              placeholder="email address"
              value={email}
              onChange={this.handleTextChange}
            />
            <button
              className="signup-submit"
              tabIndex={0}
              onClick={() => {}}
              disabled={!valid}
              style={buttonStyle}
            >
              { 'sign up' }
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default ModalContent;
