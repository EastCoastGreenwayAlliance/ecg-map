import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { extent, min } from 'd3-array';
import { area, curveBasis } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';

class ElevationProfile extends Component {
  static propTypes = {
    elevData: PropTypes.array,
    error: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string
    ]),
    isFetching: PropTypes.bool,
    route: PropTypes.object,
  }

  constructor() {
    super();
    this.state = {
      elevDataParsed: null,
    };

    this.chartContainer = null; // ref to our ElevationProfile component
    this.chartIsRendering = false; // boolean to keep React from unnecessarily rendering the chart
  }

  componentWillMount() {
    const { elevData } = this.props;
    // in case we have preloaded state
    if (elevData) {
      this.parseElevData(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { elevData } = nextProps;

    if (elevData && !isEqual(elevData, this.props.elevData)) {
      this.setState({
        elevDataParsed: this.parseElevData(nextProps),
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { elevData } = nextProps;
    const { elevDataParsed } = nextState;

    if (!isEqual(elevData, this.props.elevData) ||
      !isEqual(elevDataParsed, this.state.elevDataParsed)
    ) {
      return true;
    }

    return false;
  }

  componentDidUpdate(prevProps, prevState) {
    const { elevDataParsed } = this.state;

    if (elevDataParsed && !prevState.elevDataParsed) {
      this.renderAreaChart();
    }
  }

  parseElevData(props) {
    const { elevData, route } = props;
    const { response } = route;
    const { downsampled } = response;

    // 400 data points is a little much for a 300px x 250px chart, filter?
    // e.g., .filter((d, i) => i % 2 === 0)
    return elevData.map((point, idx) => ({
      y: Math.round(point.elevation * 3.28084), // elevation in feet
      x: downsampled[idx].properties.miles,
    }));
  }

  renderAreaChart() {
    const { elevDataParsed } = this.state;
    const chartMargins = {
      top: 20,
      right: 20,
      bottom: 50,
      left: 50
    };
    const chartWidth = this.chartContainer.offsetWidth;
    const chartHeight = this.chartContainer.offsetHeight;
    const width = chartWidth - chartMargins.right - chartMargins.left;
    const height = chartHeight - chartMargins.top - chartMargins.bottom;

    const svg = select(this.chartContainer).append('svg')
      .attr('height', chartHeight)
      .attr('width', chartWidth);

    const g = svg.append('g')
      .attr('transform', `translate(${chartMargins.left}, ${chartMargins.top})`);

    const xScale = scaleLinear()
      .range([0, width])
      .domain(extent(elevDataParsed, d => d.x));

    const yScale = scaleLinear()
      .range([height, 0])
      .domain(extent(elevDataParsed, d => d.y));

    const areaFn = area()
      .curve(curveBasis)
      .x(d => xScale(d.x))
      .y0(yScale(min(elevDataParsed, d => d.y)))
      .y1(d => yScale(d.y));

    g.append('path')
      .datum(elevDataParsed)
      .attr('fill', 'steelblue')
      .attr('d', areaFn);

    g.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(axisBottom(xScale))
      .append('text')
        .attr('fill', '#333')
        .attr('y', 35)
        .attr('x', width / 2)
        .text('Distance in miles');

    g.append('g')
        .call(axisLeft(yScale))
      .append('text')
        .attr('fill', '#333')
        .attr('transform', 'rotate(-90)')
        .attr('y', -35)
        .attr('x', -height / 3)
        .attr('text-anchor', 'end')
        .text('Height, in feet');
  }

  render() {
    return (
      <div className="ElevationProfile">
        <div className="chart-container" ref={(_) => { this.chartContainer = _; }} />
      </div>
    );
  }
}

export default ElevationProfile;
