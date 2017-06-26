import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/** Functional component to display a 404 message to the user for a URL that can't be found */
const NotFound = ({ location }) => (
  <div className="NotFound">
    <h3>Sorry, nothing to see at <em>{location.pathname.replace('/', '')}</em></h3>
    <p>Try going <Link to="/">Home</Link></p>
  </div>
);

NotFound.propTypes = {
  location: PropTypes.object,
};

export default NotFound;
