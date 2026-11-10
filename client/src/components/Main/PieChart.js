import React, {Component} from 'react'
import * as d3 from "d3"

export class PieChart extends Component {
  constructor(props){
    super(props);
    this.svgRef = React.createRef();
    this.containerRef = React.createRef();
    this.state = { size: 240 };
  }

  componentDidMount(){
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    this.drawChart();
  }

  componentWillUnmount(){
    window.removeEventListener('resize', this.handleResize);
  }

  componentDidUpdate(prevProps){
    if(prevProps.data !== this.props.data){
      this.drawChart();
    }
  }

  handleResize = () => {
    if(this.containerRef.current){
      const w = Math.min(this.containerRef.current.clientWidth - 20, 260);
      this.setState({ size: Math.max(w, 180) }, () => this.drawChart());
    }
  }

  drawChart(){
    const svg = d3.select(this.svgRef.current);
    const data = (this.props.data || []).slice(0, 6);
    const { size } = this.state;

    svg.selectAll("*").remove();

    const margin = 40;
    const radius = (size - margin * 2) / 2;
    const g = svg.append("g")
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
      g.append("text")
        .attr("fill", "#7a8299")
        .attr("font-size", "14px")
        .style("text-anchor", "middle")
        .text("No subcard views yet");
      return;
    }

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.title))
      .range([
        "#d4924a", "#8b5e3c", "#c49a6c", "#a67544", "#daa56c",
        "#6b4226", "#e8b87a", "#7a5230", "#b8813c", "#946030"
      ]);

    const pie = d3.pie()
      .value(d => d.views)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(radius * 0.4)
      .outerRadius(radius);

    const slices = g.selectAll(".slice")
      .data(pie(data))
      .enter().append("g")
      .attr("class", "slice");

    slices.append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.title))
      .attr("stroke", "#1e1814")
      .attr("stroke-width", 2);

    // Legend - always show beside the chart
    const legendG = svg.append("g")
      .attr("transform", `translate(${size + 10}, 40)`);

    data.forEach((d, i) => {
      const row = legendG.append("g")
        .attr("transform", `translate(0, ${i * 22})`);
      row.append("rect")
        .attr("width", 14).attr("height", 14)
        .attr("rx", 2)
        .attr("fill", color(d.title));
      const label = d.title.length > 16 ? d.title.substring(0, 16) + ".." : d.title;
      row.append("text")
        .attr("x", 20).attr("y", 11)
        .attr("fill", "#b0b8cc")
        .attr("font-size", "11px")
        .text(`${label} (${d.views})`);
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
