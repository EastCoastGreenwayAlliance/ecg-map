import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { Collapse } from 'react-collapse';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { quantile, min, max, range } from 'd3-array';
import { area, curveBasis } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';

import LoadingMsg from './LoadingMsg';
import ErrorMsg from './ErrorMsg';

class ElevationProfile extends Component {
  static propTypes = {
    fetchElevationData: PropTypes.func.isRequired,
    elevData: PropTypes.array,
    error: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string
    ]),
    isFetching: PropTypes.bool,
    isMobile: PropTypes.bool.isRequired,
    route: PropTypes.object,
  }

  constructor(props) {
    super(props);

    const { isMobile } = props;

    this.state = {
      elevDataParsed: null,
      isOpened: !isMobile,
    };

    this.chartContainer = null; // ref to our ElevationProfile component
    this.chartIsRendering = false; // boolean to keep React from unnecessarily rendering the chart
    this.handleClick = this.handleClick.bind(this); // handles collapse for mobile
  }

  componentWillMount() {
    const { elevData } = this.props;
    // in case we have preloaded state
    if (elevData) {
      this.parseElevData(this.props);
    }
  }

  componentDidMount() {
    const { route } = this.props;

    // our app state was hydrated with route data, get the elevation data
    if (route.response && route.response.downsampled) {
      this.getElevationData(route.response.downsampled);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { elevData, route } = nextProps;

    // we successfully retrieved a route, now get elevation data
    if (route.response && route.response.downsampled &&
      !isEqual(route.response, this.props.route.response)) {
      this.getElevationData(route.response.downsampled);
    }

    // we recieved (new) elevation data, so parse / format it
    if (elevData && !isEqual(elevData, this.props.elevData)) {
      this.setState({
        elevDataParsed: this.parseElevData(nextProps),
      });
    }

    // if we started over clear the parsed elevation data
    if (!elevData && this.props.elevData) {
      this.setState({
        elevDataParsed: null
      });

      // destroy the svg so we don't make another below it when updating,
      // no d3 general update pattern used here yet
      this.destroyChart();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { elevData, isFetching, error } = nextProps;
    const { elevDataParsed, isOpened } = nextState;

    // only render this component when the following change
    if (!isEqual(elevData, this.props.elevData) ||
      !isEqual(elevDataParsed, this.state.elevDataParsed) ||
      isOpened !== this.state.isOpened ||
      isFetching !== this.props.isFetching ||
      !isEqual(error, this.props.error)
    ) {
      return true;
    }

    return false;
  }

  componentDidUpdate(prevProps, prevState) {
    const { elevDataParsed } = this.state;

    // we have parsed data now, so render the area chart!
    if (elevDataParsed && !prevState.elevDataParsed) {
      this.renderAreaChart();
      this.renderChartHeaderContents();
    }
  }

  getElevationData(downsampled) {
    // format the downsampled route path so that it's acceptable for the elevation API
    const path = downsampled.map((feature) => {
      const { coordinates } = feature;
      return {
        lat: coordinates[1],
        lng: coordinates[0]
      };
    });

    this.props.fetchElevationData(path);
  }

  parseElevData(props) {
    // parse / format the elevation data response so that it's acceptable for a D3 area chart
    const { elevData, route } = props;
    const { response } = route;
    const { downsampled } = response;
    const METERS_TO_FEET = 3.28084;
    const METERS_TO_MILES = 0.000621371;
    const parsed = {};

    // format data for use with d3 area chart
    parsed.elev = elevData.map((point, idx) => ({
      y: Math.round(point.elevation * METERS_TO_FEET), // elevation in feet
      x: downsampled[idx].properties.miles,
    }));

    // total distance of the route in miles
    parsed.totalDistance = (() => {
      if (route && route.response && route.response.properties
        && route.response.properties.total_meters) {
        // convert meters to miles
        return Math.round(route.response.properties.total_meters * METERS_TO_MILES);
      }
      return null;
    })();

    // calculates the accumulated uphill gain over the route
    parsed.elevGain = (() => {
      const gain = parsed.elev.reduce((acc, cur, idx, arr) => {
        const prev = arr[idx - 1];

        if (prev && (cur.y > prev.y)) {
          acc += (cur.y - prev.y);
        }

        return acc;
      }, 0);

      const gainFeet = Math.round(gain);

      // so that we have thousands separated by commas
      return gainFeet.toLocaleString();
    })();

    return parsed;
  }

  destroyChart() {
    select('svg#elev-profile').remove();
    select('.heading.total-dist').remove();
    select('.heading.elev-gain').remove();
  }

  handleClick() {
    const { isMobile } = this.props;
    if (isMobile) {
      this.setState({
        isOpened: !this.state.isOpened,
      });
    }
  }

  renderAreaChart() {
    const { elevDataParsed } = this.state;

    // margins to position the inner "g" group element
    const chartMargins = {
      top: 20,
      right: 20,
      bottom: 45,
      left: 50
    };

    // actual height & width of the SVG element
    const chartWidth = this.chartContainer.offsetWidth;
    const chartHeight = this.chartContainer.offsetHeight;

    // dimensions of the area graph / inner "g" element
    const width = chartWidth - chartMargins.right - chartMargins.left;
    const height = chartHeight - chartMargins.top - chartMargins.bottom;

    // min & max values for calculating scales
    const minXValue = min(elevDataParsed.elev, d => d.x);
    const maxXValue = max(elevDataParsed.elev, d => d.x);
    const minYValue = 0;
    const maxYValue = max(elevDataParsed.elev, d => d.y);

    // values for use with x-axis scale ticks
    const quantilesX = range(0, 1.25, 0.25).map(value =>
      quantile(elevDataParsed.elev, value, d => d.x));

    // values for use with y-axis scale ticks
    const quantilesY = [
      minYValue,
      Math.round(maxYValue / 4),
      Math.round(maxYValue / 2),
      Math.round(maxYValue / 4) * 3,
      maxYValue,
    ];

    // create the SVG element
    const svg = select(this.chartContainer).append('svg')
      .attr('height', chartHeight)
      .attr('width', chartWidth)
      .attr('id', 'elev-profile');

    // append the parent group element
    const g = svg.append('g')
      .attr('transform', `translate(${chartMargins.left}, ${chartMargins.top})`);

    // set x scale range and domain
    const xScale = scaleLinear()
      .range([0, width])
      .domain([minXValue, maxXValue]);

    // set y scale range and domain
    const yScale = scaleLinear()
      .range([height, 0])
      .domain([minYValue, maxYValue]);

    // set up the area path function
    const areaFn = area()
      .curve(curveBasis)
      .x(d => xScale(d.x))
      .y0(yScale(minYValue))
      .y1(d => yScale(d.y));

    // create and append the path
    g.append('path')
      .datum(elevDataParsed.elev)
      .attr('fill', '#1482C5')
      .attr('d', areaFn);

    // create the x axis and label
    g.append('g')
        .classed('axis', true)
        .attr('transform', `translate(0, ${height})`)
        .call(axisBottom(xScale).tickValues(quantilesX))
      .append('text')
        .attr('fill', '#333')
        .attr('y', 35)
        .attr('x', width / 2)
        .text('Distance in miles');

    // create the y axis and label
    g.append('g')
        .classed('axis', true)
        .call(axisLeft(yScale).tickValues(quantilesY))
      .append('text')
        .attr('transform', 'rotate(90)')
        .attr('y', 40)
        .attr('x', height - 30)
        .attr('text-anchor', 'end')
        .text('Height in feet');
  }

  renderChartHeaderContents() {
    const { elevDataParsed } = this.state;
    const { totalDistance, elevGain } = elevDataParsed;

    // header for total distance & elevation gain labels
    const header = select('.elev-prof--header');

    // text for total distance
    header.append('p')
        .classed('heading total-dist', true)
        .html('Total Dist:')
      .append('span')
        .html(` ${totalDistance} mi`);

    // text for total elevation gain
    header.append('p')
        .classed('heading elev-gain', true)
        .html('Elev Gain:')
      .append('span')
        .html(` ${elevGain} ft`);
  }

  render() {
    const { isOpened } = this.state;
    const { route, isFetching, error } = this.props;

    if (route.response && route.response.downsampled) {
      return (
        <div className="ElevationProfile">
          <button onClick={this.handleClick} className="elev-prof--header" />
          <Collapse isOpened={isOpened} fixedHeight={165}>
            {
              isFetching &&
              <LoadingMsg message={'Loading elevation profile...'} />
            }
            {
              error &&
              <ErrorMsg {...{ error }} />
            }
            <div className="chart-container" ref={(_) => { this.chartContainer = _; }} />
          </Collapse>
        </div>
      );
    }

    return null;
  }
}

export default ElevationProfile;
