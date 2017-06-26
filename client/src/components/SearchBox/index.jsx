import React from 'react';

import SearchInputConnected from '../../containers/SearchInputConnected';
import SearchResultsConnected from '../../containers/SearchResultsConnected';

/** Functional Component that houses
  - Location Search text input
  - GeoRouting & Location Search Results

  NOTE: the latter component, <SearchResults />, is basically a controller that
  handles logic for the UX flow of choosing a start and end location on the ECG
  and loads sub components for displaying the appropriate UI for each step
  of searching a start and end, then displaying the results when a route is
  is not found.
  */
const SearchBox = () => (
  <div className="SearchBox">
    <SearchInputConnected />
    <SearchResultsConnected />
  </div>
);

export default SearchBox;
