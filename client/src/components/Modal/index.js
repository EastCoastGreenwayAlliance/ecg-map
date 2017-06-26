import React from 'react';
import PropTypes from 'prop-types';

import ModalForm from './ModalForm';
import PostSignupMsg from './PostSignupMsg';

/** Functional Component for housing the Modal
    - houses a form for enabling the user to signup for ECGA emails
    - tells the user if their signup was successful
    - allows the user to prevent the Modal from displaying again when revisiting the site
    - uses React Modal, an accessible modal component
*/
const ModalContent = (props) => {
  const { handleCloseModal, mailchimpResponse, mailchimpError } = props;

  return (
    <div className="ModalContent">
      <button className="modal-content__close" onClick={() => handleCloseModal()}>
        ×
      </button>
      <div className="modal-content__top-box">
        <h5 className="modal-content__greeting-copy">
          The East Coast Greenway is a 2,500 mile traffic free path linking east
          coast cities from Maine to Florida. Use this map to get to the Greenway
          and plan trips along it.
        </h5>
      </div>
      {
        (mailchimpResponse || mailchimpError) &&
        <PostSignupMsg
          success={mailchimpResponse !== ''}
          error={mailchimpError !== null}
          {...{ handleCloseModal }}
        />
      }
      { (!mailchimpResponse && !mailchimpError) &&
        <ModalForm {...props} />
      }
    </div>
  );
};

ModalContent.propTypes = {
  handleCloseModal: PropTypes.func.isRequired,
  handleFormSubmit: PropTypes.func.isRequired,
  mailchimpResponse: PropTypes.string,
  mailchimpError: PropTypes.object,
};

export default ModalContent;
