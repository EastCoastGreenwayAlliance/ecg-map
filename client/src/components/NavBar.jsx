import React from 'react';
import PropTypes from 'prop-types';

// Functional component that displays the Navbar / Header
const NavBar = (props) => {
  const { isMobile } = props;

  const bgImage = isMobile ? 'logo-ecg-mobile@2x.png' : 'logo-ecg.png';
  const width = isMobile ? 79 : 163;
  const height = isMobile ? 41 : 85;
  return (
    <div className="Navbar">
      <a target="_blank" rel="noopener noreferrer" href="https://www.greenway.org">
        <div
          className="ecg-logo"
          style={{
            backgroundImage: `url(/assets/logo/${bgImage})`,
            display: 'inline-block',
            height,
            width,
          }}
        />
      </a>
    </div>
  );
};

NavBar.propTypes = {
  isMobile: PropTypes.bool.isRequired,
};

export default NavBar;
