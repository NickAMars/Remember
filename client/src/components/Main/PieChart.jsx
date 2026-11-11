import React, {Component} from 'react'
// perf Increase: named imports let the bundler drop the parts of d3 this chart doesn't use.
import { arc as d3Arc, pie as d3Pie, scaleOrdinal, select } from 'd3';
import { throttleToFrame } from '../../utils/throttle';

export class PieChart extends Component {
  constructor(props){
    super(props);
    this.svgRef = React.createRef();
    this.containerRef = React.createRef();
    this.state = { size: 240 };
  }

  componentDidMount(){
    // handleResize also draws, so the chart is drawn once on mount instead of twice.
    this.handleResize();
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount(){
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
      const availableWidth = Math.min(this.containerRef.current.clientWidth - 20, 260);
      const size = Math.max(availableWidth, 180);
      // perf Increase: skip the redraw when the size didn't change.
      if (size === this.state.size && this.hasDrawn) return;
      this.setState({ size }, () => this.drawChart());
    }
  }

  drawChart(){
    this.hasDrawn = true;
    const svg = select(this.svgRef.current);
    const data = (this.props.data || []).slice(0, 6);
    const { size } = this.state;

    svg.selectAll("*").remove();

    const margin = 40;
    const radius = (size - margin * 2) / 2;
    const chartGroup = svg.append("g")
      .attr("transform", `translate(${size / 2},${size / 2 + 20})`);

    // Title
    svg.append("text")
      .attr("x", size / 2)
      .attr("y", 22)
      .attr("fill", "#c49a6c")
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .attr("letter-spacing", "3px")
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

    // Legend - always show beside the chart
    const legendGroup = svg.append("g")
      .attr("transform", `translate(${size + 10}, 40)`);

    data.forEach((entry, index) => {
      const row = legendGroup.append("g")
        .attr("transform", `translate(0, ${index * 22})`);
      row.append("rect")
        .attr("width", 14).attr("height", 14)
        .attr("rx", 2)
        .attr("fill", color(entry.title));
      const label = entry.title.length > 16 ? entry.title.substring(0, 16) + ".." : entry.title;
      row.append("text")
        .attr("x", 20).attr("y", 11)
        .attr("fill", "#b0b8cc")
        .attr("font-size", "11px")
        .text(`${label} (${entry.views})`);
    });
  }

  render(){
    const { size } = this.state;
    return(
      <div className="topcards__graph" ref={this.containerRef}>
        <svg
          ref={this.svgRef}
          width={size + 200}
          height={size + 40}
          style={{display: 'block', margin: '0 auto'}}>
        </svg>
      </div>
    )
  }
}
