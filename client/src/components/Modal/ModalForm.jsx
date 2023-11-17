import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { setStorageItem, getStorageItem } from '../../utils/localStorage';

class ModalForm extends Component {
  static propTypes = {
    handleCloseModal: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    const showModal = getStorageItem('ecg-modal-form');
    this.state = {
      noDisplayInFuture: showModal || false,
      email: '',
      valid: false,
    };
  }

  componentDidMount() {
    const { noDisplayInFuture } = this.state;
    // close the modal prematurely if user checked "don't show in the future"
    if (noDisplayInFuture) this.props.handleCloseModal();
    else {
      // EveryAction uses this script tag to "activate" the form; do that now that we're visible
      const sc = document.createElement('script');
      sc.type = 'text/javascript';
      sc.src = 'https://static.everyaction.com/ea-actiontag/at.js';
      document.head.appendChild(sc);

      // then keep polling to see if that EveryAction form has loaded yet
      // so we can attach to its submit handler, to set noDisplayInFuture when they submit it
      // so we don't ask again next time
      // no clean React way to do this, since the form is outside our control
      const keepcheckingforsignupform = setInterval(() => {
        const signupform = this.signupformdiv.querySelector('form');
        if (!signupform) return;

        clearInterval(keepcheckingforsignupform);

        signupform.addEventListener('submit', () => {
          this.setState({
            noDisplayInFuture: true,
          });
        });
      }, 0.1 * 1000);
    }
  }

  componentWillUpdate(nextProps, nextState) {
    // set localstorage to not show intro modal if they checked "don't show in the future"
    if (this.state.noDisplayInFuture !== nextState.noDisplayInFuture) {
      setStorageItem('ecg-modal-form', nextState.noDisplayInFuture);
    }
  }

  render() {
    const { noDisplayInFuture } = this.state;

    // EveryAction form https://support.greenway.org/a/maptool
    // see also the script tag which "activates" the form when the component is mounted
    return (
      <div className="ModalForm modal-content__bottom-box">
        <div>
          <div
            className="ngp-form"
            data-form-url="https://secure.everyaction.com/v1/Forms/66JDJ7ItbEuvdlxpQoPXWQ2"
            data-fastaction-endpoint="https://fastaction.ngpvan.com"
            data-inline-errors="true"
            data-fastaction-nologin="true"
            data-databag-endpoint="https://profile.ngpvan.com"
            data-databag="everybody"
            ref={(_) => { this.signupformdiv = _; }}
          />
        </div>
        <hr />
        <fieldset className="hide-modal-group">
          <input
            className="hide-modal-checkbox"
            id="hide-modal"
            type="checkbox"
            checked={noDisplayInFuture}
            onChange={this.handleCheckboxChange}
          />
          <label
            className="hide-modal-label"
            htmlFor="hide-modal"
          >
            { 'Do not display this message in the future' }
          </label>
        </fieldset>
      </div>
    );
  }
}

export default ModalForm;
