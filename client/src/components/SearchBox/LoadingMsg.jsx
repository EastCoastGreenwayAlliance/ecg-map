import React from 'react';
import PropTypes from 'prop-types';

// Loading message to show the user during async and computationally heavy tasks
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
