import React from 'react';
import PropTypes from 'prop-types';

// Functional component that displays the Navbar / Header
const NavBar = (props) => {
  const { isMobile } = props;
  const bgImage = isMobile ? 'logo-ecg-mobile@2x.png' : 'logo-ecg.png';

  return (
    <nav className="Navbar">
      <div className="navbar-left">
        <a className="ecg-link" target="_blank" rel="noopener noreferrer" href="https://www.greenway.org">
          <img
            className="ecg-logo"
            alt="East Coast Greenway logo"
            title="Visit the East Coast Greenway website"
            src={`/assets/logo/${bgImage}`}
          />
        </a>
      </div>
      <div className="navbar-right">
        <p className="about-feedback">
          <a target="_blank" rel="noopener noreferrer" href="https://www.greenway.org/route-map">
            About, Feedback, & Safety Guidance
          </a>
        </p>
      </div>
    </nav>
  );
};

NavBar.propTypes = {
  isMobile: PropTypes.bool.isRequired,
};

export default NavBar;
