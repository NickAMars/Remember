import React, {Component} from 'react'
import {beginDate} from  '../../constance'
// data,
import * as d3 from "d3"

const width = 500;
const height = 500;
const margin = { top: 15, right: 15,
                  bottom: 20,left: 30};

export class Chart extends Component{
    state = {
      line: null,
      xScale: d3.scaleTime().domain(beginDate(new Date())).range([margin.left, width - margin.right]),
      yScale: d3.scaleLinear().range([height - margin.bottom, margin.top ]),
      areaGenerator:d3.area().curve(d3.curveLinear)
    };

    constructor(props){
      super(props);
      this.updateD3 = this.updateD3.bind(this);
    }
          // areaGenerator: d3.line()
    // .curve(d3.curveLinear)
    // curve(d3.curveCardinal)


    xAxis = d3.axisBottom().scale(this.state.xScale)
            .ticks(7)
            // .orient("bottom") doesnt work
          .tickSize(0)
          .tickFormat(d3.timeFormat("%m-%d"));
    yAxis = d3.axisLeft().scale(this.state.yScale)
          // .tickSize( 2)
          .tickFormat(d3.format(".0s"));
  componentDidMount(){
    this.updateD3();
    // get information needed from the server to do this
  }
  static getDerivedStateFromProps(nextProps, prevState){
     // if (!nextProps.data) return null;
     const {data} = nextProps;
     const {xScale, yScale,  areaGenerator} = prevState;
      const maxTime = d3.max(data, d => d.time)/(1000); // in second
      yScale.domain([0, maxTime]);
     areaGenerator.x(d => xScale(d.date));
     areaGenerator.y0(height- margin.top);
     areaGenerator.y1(d => yScale( d.time/1000) );
     // areaGenerator.define(d => d.date !== null);
     const line = areaGenerator(data);
     return {line};

  }
    // manipulating the DOM (seems to only go when page load)
  componentDidUpdate() {
    this.updateD3();
   }
updateD3(){
  d3.select(this.refs.xAxis).call(this.xAxis);
  d3.select(this.refs.yAxis).call(this.yAxis);
  // TITLE
    d3.select(this.refs.svg)
      .append("text")
      .attr("x", width/2)
      .attr("y", margin.top)
      .attr("font-size", "1rem")
      .attr("font-weight","900")
      .attr("letter-spacing","10px")
      .style("text-anchor", "middle")
      .text("Top Five");
    //DATE
    d3.select(this.refs.svg)
      .append("text")
      .attr("x", width/2)
      .attr("y",height)
      .attr("font-size", "1rem")
      .attr("font-weight","900")
      .attr("letter-spacing","10px")
      .style("text-anchor", "middle")
      .text("DATE (mm/dd)");
      //TIME
    d3.select(this.refs.svg)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("font-size", "1.4rem")
      .attr("x", -height/2)
      .attr("y", margin.left -5)
      .attr("dy", "-1.1em")
      .attr("letter-spacing","10px")
      .style("text-anchor", "middle")
      .text("TIME (sec)");
}

  render(){
    return(
      <div className="topcards__graph">
        <svg
          ref='svg'
          width={width}
          height={height}>
          <path d= {this.state.line} fill= 'orangered' strokeWidth="0" />
          <g>
            <g ref='xAxis' transform={`translate(0, ${height - margin.top})`} />
            <g ref='yAxis' transform={`translate(${margin.left}, 0)`} />
          </g>
        </svg>
      </div>
    )
  }
}
// stroke={'#EEE'}
/* problem *The area goes under the graph so i apply a temorary fize */
