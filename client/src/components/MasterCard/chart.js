import React, {Component} from 'react'
import {beginDate, data} from  '../../constance'
// data,
import * as d3 from "d3"

const width = 500;
const height = 500;
const margin = { top: 10, right: 13,
                  bottom: 20,left: 20};

export class Chart extends Component{
    state = {
      line: null,
      xScale: d3.scaleTime().domain(beginDate(new Date())).range([margin.left, width - margin.right]),
      yScale: d3.scaleLinear().range([height - margin.bottom, margin.top ]),
      // areaGenerator: d3.line()
      areaGenerator: d3.area()
      // .curve(d3.curveCardinal)
    };
    // this.Date = new Date();
    // console.log(this.Date);


    xAxis = d3.axisBottom().scale(this.state.xScale)
          .tickFormat(d3.timeFormat("%m-%d"));
    yAxis = d3.axisLeft().scale(this.state.yScale)
      .tickFormat(d3.format(".0s"));
  componentDidMount(){
    // get information needed from the server to do this
  }
// weekdays(new Date().getDate())
  // xScale = d3.scaleTime().domain(beginDate(new Date()))
  //         .range([margin.left, width - margin.right]);
                          // .range([beginDate(new Date()) ,new Date()]);
  // xScale = d3.scaleTime().domain([0,width])
  //                         .range([new Date(2019, 0, 7), new Date(2019, 0, 14)]);
  // areaGenerator = d3.line();
  //Can only use the nextProps and current state
  static getDerivedStateFromProps(nextProps, prevState){
     // if (!nextProps.data) return null;
     const {xScale, yScale,  areaGenerator} = prevState;
      const maxTime = d3.max(data, d => d.time)/(1000); // in second
      yScale.domain([0, maxTime]);
      // console.log(yScale(data[0].time));
     areaGenerator.x(d => xScale(d.date));
     areaGenerator.y0(height- margin.bottom);
     areaGenerator.y1(d => yScale( d.time/1000) );
     const line = areaGenerator(data);
     // console.log(line);
     return {line};

  }

  componentDidUpdate() {
    // manipulating the DOM
  d3.select(this.refs.xAxis).call(this.xAxis);
  d3.select(this.refs.yAxis).call(this.yAxis);
}

  render(){
    // console.log(this.areaGenerator(data)
    // .x(d => this.xScale(d.date))
    // .y(d => 300)
  // );
  // console.log( this.areaGenerator(data) );
    // console.log(this.xScale(new Date(2019,0,4)));
      // console.log(this.state.date.getFullYear());
    return(
      <div className="topcards__graph">
        <svg
          width={width}
          height={height}>
          <path d= {this.state.line} fill= 'pink' stroke-width="2" stroke={'#00F'}/>
          <g>
            <g ref='xAxis' transform={`translate(0, ${height - margin.bottom})`} />
            <g ref='yAxis' transform={`translate(${margin.left}, 0)`} />
          </g>
        </svg>
      </div>
    )
  }
}
