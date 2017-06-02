import React from 'react';
import PropTypes from 'prop-types';

import { baseURL } from '../common/config';

const NavBar = (props) => {
  const { isMobile } = props;

  const bgImage = isMobile ? 'logo-ecg-mobile@2x.png' : 'logo-ecg.png';
  const width = isMobile ? 79 : 163;
  const height = isMobile ? 41 : 85;
  return (
    <div className="Navbar">
      <div
        className="ecg-logo"
        style={{
          backgroundImage: `url(${baseURL}/assets/logo/${bgImage})`,
          height,
          width,
        }}
      />
    </div>
  );
};

NavBar.propTypes = {
  isMobile: PropTypes.bool.isRequired,
};

export default NavBar;
