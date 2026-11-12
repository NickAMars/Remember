import React, {Component} from 'react'
// perf Increase: named imports let the bundler drop the parts of d3 this chart doesn't use.
import { axisBottom, axisLeft, format, max, scaleBand, scaleLinear, select } from 'd3';
import { throttleToFrame } from '../../utils/throttle';

const WIDE_MARGIN = { top: 40, right: 20, bottom: 70, left: 60 };
// Phones: less room on the left, more below for the slanted deck titles.
const NARROW_MARGIN = { top: 40, right: 12, bottom: 80, left: 40 };
const NARROW_WIDTH = 420;

export class Chart extends Component{
    constructor(props){
      super(props);
      this.svgRef = React.createRef();
      this.containerRef = React.createRef();
      this.state = {
        width: 500,
        height: 350
      };
    }

  componentDidMount(){
    // handleResize also draws, so the chart is drawn once on mount instead of twice.
    this.handleResize();
    // Bug fix: the chart only resized with the window, so it kept a stale width when its
    // box changed (phone rotation, the side menu opening). Watch the box itself.
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.onWindowResize);
      this.resizeObserver.observe(this.containerRef.current);
    } else {
      window.addEventListener('resize', this.onWindowResize);
    }
  }

  componentWillUnmount(){
    if (this.resizeObserver) this.resizeObserver.disconnect();
    window.removeEventListener('resize', this.onWindowResize);
    this.onWindowResize.cancel();
  }

  // perf Increase: redraw at most once per frame while the window is being resized.
  onWindowResize = throttleToFrame(() => this.handleResize());

  componentDidUpdate(prevProps){
    if(prevProps.data !== this.props.data){
      this.drawChart();
    }
  }

  handleResize = () => {
    if(this.containerRef.current){
      const container = this.containerRef.current;
      const styles = window.getComputedStyle(container);
      // Bug fix: the box's padding wasn't subtracted, so on phones the chart was wider than
      // its box and the CSS squeezed it out of shape.
      const containerWidth = container.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
      const width = Math.max(Math.min(Math.floor(containerWidth), 600), 220);
      const height = Math.round(Math.max(width * 0.6, 240));
      // perf Increase: skip the redraw when the size didn't change.
      if (width === this.state.width && height === this.state.height && this.hasDrawn) return;
      this.setState({ width, height }, () => this.drawChart());
    }
  }

  drawChart(){
    this.hasDrawn = true;
    const svg = select(this.svgRef.current);
    const {data} = this.props;
    const {width, height} = this.state;
    const narrow = width < NARROW_WIDTH;
    const margin = narrow ? NARROW_MARGIN : WIDE_MARGIN;
    const maxLabelLength = narrow ? 10 : 14;

    svg.selectAll("*").remove();

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    if(!data || data.length === 0){
      chartGroup.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight / 2)
        .attr("fill", "#7a8299")
        .attr("font-size", "14px")
        .style("text-anchor", "middle")
        .text("No card data yet");
      return;
    }

    // X Scale - one bar per card title
    const xScale = scaleBand()
      .domain(data.map(entry => entry.title))
      .range([0, chartWidth])
      .padding(0.3);

    const maxViews = max(data, entry => entry.maxTime) || 1;
    // Bug fix: with few views the axis showed "0 0 1 1 1" (rounded fractions). Views are whole numbers.
    const tickCount = Math.min(5, maxViews);
    const yScale = scaleLinear()
      .domain([0, maxViews])
      .nice()
      .range([chartHeight, 0]);

    // Grid lines
    chartGroup.append("g")
      .selectAll("line")
      .data(yScale.ticks(tickCount))
      .enter().append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", entry => yScale(entry))
      .attr("y2", entry => yScale(entry))
      .attr("stroke", "rgba(255,255,255,0.06)")
      .attr("stroke-dasharray", "3,3");

    // Bar colors
    const barColors = ["#d4924a", "#5b9bd5", "#e06060", "#6bc76b", "#b07cc6"];

    // Bars
    chartGroup.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("x", entry => xScale(entry.title))
      .attr("y", entry => yScale(entry.maxTime))
      .attr("width", xScale.bandwidth())
      .attr("height", entry => chartHeight - yScale(entry.maxTime))
      .attr("fill", (entry, index) => barColors[index % barColors.length])
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("opacity", 0.9);

    // X Axis - card titles
    chartGroup.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(axisBottom(xScale)
        .tickSize(0))
      .call(axis => axis.select(".domain").attr("stroke", "rgba(255,255,255,0.15)"))
      .selectAll("text")
      .attr("fill", "#b0b8cc")
      .attr("font-size", "11px")
      .attr("dy", "1em")
      .attr("transform", narrow ? "rotate(-35)" : "rotate(-25)")
      .style("text-anchor", "end")
      .each(function() {
        const text = select(this);
        if (text.text().length > maxLabelLength) {
          text.text(text.text().substring(0, maxLabelLength - 2) + "...");
        }
      });

    // Y Axis
    chartGroup.append("g")
      .call(axisLeft(yScale)
        .ticks(tickCount)
        .tickSize(0)
        .tickFormat(format("d")))
      .call(axis => axis.select(".domain").attr("stroke", "rgba(255,255,255,0.15)"))
      .selectAll("text")
      .attr("fill", "#b0b8cc")
      .attr("font-size", "11px");

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 24)
      .attr("fill", "#c49a6c")
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .attr("letter-spacing", "3px")
      .style("text-anchor", "middle")
      .text("CARD VIEWS");

    // Y label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 16)
      .attr("fill", "#7a8299")
      .attr("font-size", "11px")
      .style("text-anchor", "middle")
      .text("VIEWS");
  }

  render(){
    const {width, height} = this.state;
    return(
      <div className="topcards__graph" ref={this.containerRef}>
        <svg
          ref={this.svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{display: 'block', margin: '0 auto'}}>
        </svg>
      </div>
    )
  }
}
