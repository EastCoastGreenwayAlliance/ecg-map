import React from 'react';

// Options to show the user after they've accepted the start location
const StartAcceptedOptions = () => (
  <div className="SearchStartAcceptedOptions">
    <p>Search End Point or:</p>
    <button className="center blue" tabIndex="0" onClick={() => {}}>
      View North Cues
    </button>
    <button className="center blue" tabIndex="0" onClick={() => {}}>
      View South Cues
    </button>
  </div>
);

export default StartAcceptedOptions;
