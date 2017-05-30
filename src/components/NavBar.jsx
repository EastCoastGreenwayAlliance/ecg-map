import React from 'react';

import { baseURL } from '../common/config';

// the simplest React component ever possible...
export default () => (
  <div className="Navbar">
    <div style={{ backgroundImage: `url(${baseURL}/assets/logo/logo-ecg.png)` }} className="ecg-logo" />
  </div>
);
