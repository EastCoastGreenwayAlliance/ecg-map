import React from 'react';
import PropTypes from 'prop-types';

// Handles displaying of an error message to the user
const ErrorMsg = (props) => {
  const { error } = props;
  let errorMsg;

  if (typeof error === 'string') {
    errorMsg = error;
  }

  if (typeof error === 'object') {
    errorMsg = error.message ?
      `${error.message}, please try again.` :
      'Something went wrong, please try again.';
  }

  return (
    <div className="ErrorMessage">
      <p>{ errorMsg }</p>
    </div>
  );
};

ErrorMsg.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]).isRequired
};

export default ErrorMsg;
