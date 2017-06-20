import React from 'react';
import PropTypes from 'prop-types';

const MsgThanks = (props) => {
  const { handleCloseModal, success, error } = props;

  return (
    <div className="PostSignupMsg modal-content__signup-msg">
      {
        success &&
        <p className="msg-thanks">Thank you for signing up!</p>
      }
      {
        error &&
        <p className="msg-error">Ouch! Something went wrong :(</p>
      }
      <button className="close" onClick={() => handleCloseModal()}>Close</button>
    </div>
  );
};

MsgThanks.propTypes = {
  handleCloseModal: PropTypes.func.isRequired,
  success: PropTypes.bool,
  error: PropTypes.bool,
};

export default MsgThanks;
