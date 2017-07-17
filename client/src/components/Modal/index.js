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
          The East Coast Greenway connects 15 states, 450 cities and towns, and
          3,000 miles of people-powered trails from Maine to Florida —the country’s
          longest biking and walking route. Use this map to get to the greenway
          and plan a trip.
        </h5>
      </div>
      {
        (mailchimpResponse || mailchimpError) &&
        <PostSignupMsg
          success={mailchimpResponse === 'Signed Up!'}
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
  mailchimpError: PropTypes.oneOfType([
    PropTypes.object, PropTypes.string
  ]),
};

export default ModalContent;
