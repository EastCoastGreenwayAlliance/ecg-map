import React from 'react';

import SearchInputConnected from '../../containers/SearchInputConnected';
import SearchResultsConnected from '../../containers/SearchResultsConnected';

/** Class that houses the Location Search & GeoRouting results */
const SearchBox = () => (
  <div className="SearchBox">
    <SearchInputConnected />
    <SearchResultsConnected />
  </div>
);

export default SearchBox;
