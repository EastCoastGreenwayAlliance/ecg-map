import React from 'react';
import PropTypes from 'prop-types';

import ModalForm from './ModalForm';

/** Functional Component for housing the Modal
    - houses a form for enabling the user to signup for ECGA emails
    - tells the user if their signup was successful
    - allows the user to prevent the Modal from displaying again when revisiting the site
    - uses React Modal, an accessible modal component
*/
const ModalContent = (props) => {
  const { handleCloseModal } = props;

  return (
    <div className="ModalContent">
      <button className="modal-content__close" onClick={() => handleCloseModal()}>
        ×
      </button>
      <ModalForm {...props} />
    </div>
  );
};

ModalContent.propTypes = {
  handleCloseModal: PropTypes.func.isRequired,
};

export default ModalContent;
