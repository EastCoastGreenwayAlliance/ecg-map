import React from 'react';
import PropTypes from 'prop-types';
import Link from 'react-router-dom';

const NotFound = ({ location }) => (
  <div>
    <h3>Sorry, we couldn't find {location.pathname}</h3>
    <p>Try going <Link to="/">Home</Link></p>
  </div>
);

NotFound.propTypes = {
  location: PropTypes.string.isRequired,
};

export default NotFound;
