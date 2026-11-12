import React, {Component} from 'react'
// perf Increase: named imports let the bundler drop the parts of d3 this chart doesn't use.
import { arc as d3Arc, pie as d3Pie, scaleOrdinal, select } from 'd3';
import { throttleToFrame } from '../../utils/throttle';

export class PieChart extends Component {
  constructor(props){
    super(props);
    this.svgRef = React.createRef();
    this.containerRef = React.createRef();
    this.state = { size: 240, availableWidth: 440 };
  }

  componentDidMount(){
    // handleResize also draws, so the chart is drawn once on mount instead of twice.
    this.handleResize();
    // Watch the chart's own box, so it also redraws when that changes without a window resize.
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
      const availableWidth = Math.floor(container.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight));
      const size = Math.max(Math.min(availableWidth, 260), 180);
      // perf Increase: skip the redraw when the size didn't change.
      if (size === this.state.size && availableWidth === this.state.availableWidth && this.hasDrawn) return;
      this.setState({ size, availableWidth }, () => this.drawChart());
    }
  }

  drawChart(){
    this.hasDrawn = true;
    const svg = select(this.svgRef.current);
    const data = (this.props.data || []).slice(0, 6);
    const { size } = this.state;
    const { width, height, legendBelow } = this.layout();

    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

    const margin = 40;
    const radius = (size - margin * 2) / 2;
    const chartGroup = svg.append("g")
      .attr("transform", `translate(${legendBelow ? width / 2 : size / 2},${size / 2 + 20})`);

    // Title
    svg.append("text")
      .attr("x", legendBelow ? width / 2 : size / 2)
      .attr("y", 22)
      .attr("fill", "#c49a6c")
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .attr("letter-spacing", legendBelow ? "1.5px" : "3px")
      .style("text-anchor", "middle")
      .text("MOST VIEWED SUBCARDS");

    if(!data || data.length === 0){
      chartGroup.append("text")
        .attr("fill", "#7a8299")
        .attr("font-size", "14px")
        .style("text-anchor", "middle")
        .text("No subcard views yet");
      return;
    }

    const color = scaleOrdinal()
      .domain(data.map(entry => entry.title))
      .range([
        "#d4924a", "#5b9bd5", "#e06060", "#6bc76b", "#b07cc6",
        "#e8b44a", "#4dc9c9", "#e87da0", "#7a9e4f", "#c78347"
      ]);

    const pieLayout = d3Pie()
      .value(entry => entry.views)
      .sort(null);

    const arcShape = d3Arc()
      .innerRadius(radius * 0.4)
      .outerRadius(radius);

    const slices = chartGroup.selectAll(".slice")
      .data(pieLayout(data))
      .enter().append("g")
      .attr("class", "slice");

    slices.append("path")
      .attr("d", arcShape)
      .attr("fill", entry => color(entry.data.title))
      .attr("stroke", "#1e1814")
      .attr("stroke-width", 2);

    // Legend beside the chart, or below it when there isn't room (phones).
    // Bug fix: it was always beside the chart, so on a phone it was cut off at the screen edge.
    const legendGroup = svg.append("g")
      .attr("transform", legendBelow ? `translate(8, ${size + 20})` : `translate(${size + 10}, 40)`);
    const maxLabelLength = legendBelow ? Math.max(12, Math.floor((width - 70) / 6.5)) : 16;

    data.forEach((entry, index) => {
      const row = legendGroup.append("g")
        .attr("transform", `translate(0, ${index * 22})`);
      row.append("rect")
        .attr("width", 14).attr("height", 14)
        .attr("rx", 2)
        .attr("fill", color(entry.title));
      const label = entry.title.length > maxLabelLength ? entry.title.substring(0, maxLabelLength) + ".." : entry.title;
      row.append("text")
        .attr("x", 20).attr("y", 11)
        .attr("fill", "#b0b8cc")
        .attr("font-size", "11px")
        .text(`${label} (${entry.views})`);
    });
  }

  /** Chart size, with the legend moved under the pie when the box is too narrow for both. */
  layout() {
    const { size, availableWidth } = this.state;
    const rows = Math.min((this.props.data || []).length, 6);
    const legendBelow = availableWidth < size + 200;
    if (!legendBelow) return { width: size + 200, height: size + 40, legendBelow };
    return { width: Math.max(size, availableWidth), height: size + 20 + rows * 22 + 8, legendBelow };
  }

  render(){
    const { width, height } = this.layout();
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
