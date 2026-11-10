import React, {Component} from 'react'
import * as d3 from "d3"

const margin = { top: 40, right: 20, bottom: 70, left: 60 };

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
      const containerWidth = this.containerRef.current.clientWidth;
      const w = Math.min(containerWidth - 20, 600);
      const h = Math.max(w * 0.6, 250);
      this.setState({ width: w, height: h }, () => this.drawChart());
    }
  }

  drawChart(){
    const svg = d3.select(this.svgRef.current);
    const {data} = this.props;
    const {width, height} = this.state;

    svg.selectAll("*").remove();

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    if(!data || data.length === 0){
      g.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight / 2)
        .attr("fill", "#7a8299")
        .attr("font-size", "14px")
        .style("text-anchor", "middle")
        .text("No card data yet");
      return;
    }

    // X Scale - one bar per card title
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.title))
      .range([0, chartWidth])
      .padding(0.3);

    const maxViews = d3.max(data, d => d.maxTime) || 1;
    const yScale = d3.scaleLinear()
      .domain([0, maxViews])
      .nice()
      .range([chartHeight, 0]);

    // Grid lines
    g.append("g")
      .selectAll("line")
      .data(yScale.ticks(5))
      .enter().append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "rgba(255,255,255,0.06)")
      .attr("stroke-dasharray", "3,3");

    // Bar colors
    const barColors = ["#d4924a", "#5b9bd5", "#e06060", "#6bc76b", "#b07cc6"];

    // Bars
    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("x", d => xScale(d.title))
      .attr("y", d => yScale(d.maxTime))
      .attr("width", xScale.bandwidth())
      .attr("height", d => chartHeight - yScale(d.maxTime))
      .attr("fill", (d, i) => barColors[i % barColors.length])
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("opacity", 0.9);

    // X Axis - card titles
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(0))
      .call(g => g.select(".domain").attr("stroke", "rgba(255,255,255,0.15)"))
      .selectAll("text")
      .attr("fill", "#b0b8cc")
      .attr("font-size", "11px")
      .attr("dy", "1em")
      .attr("transform", "rotate(-25)")
      .style("text-anchor", "end")
      .each(function() {
        const text = d3.select(this);
        if (text.text().length > 14) {
          text.text(text.text().substring(0, 12) + "...");
        }
      });

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(0)
        .tickFormat(d3.format("d")))
      .call(g => g.select(".domain").attr("stroke", "rgba(255,255,255,0.15)"))
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
          style={{display: 'block', margin: '0 auto'}}>
        </svg>
      </div>
    )
  }
}
