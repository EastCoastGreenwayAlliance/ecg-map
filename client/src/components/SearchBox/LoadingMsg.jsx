import React from 'react';
import PropTypes from 'prop-types';

// Search Message to display during async geocoding & nearest ECG segment node
const LoadingMsg = (props) => {
  const { message } = props;
  return (
    <div className="LoadingMessage">
      <p>{ message || 'Loading...' }</p>
    </div>
  );
};

LoadingMsg.propTypes = {
  message: PropTypes.string,
};

export default LoadingMsg;
