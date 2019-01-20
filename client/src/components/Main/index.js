import React, {Component} from 'react';
import {TopFiveCard} from '../Helper/Cards';
import {CreateMaster} from '../Helper/Form';
import {Chart} from  './chart';
import { connect } from 'react-redux';
// import {data} from  '../../constance'
// import * as d3 from "d3"

import {data} from  '../../constance'
class MasterCard extends Component{
  componentDidMount(){
    // this.props.serverTest();
   // call action creater which places the result into the state
  }
  constructor(props){
    super(props);
    // this.state={
    //
    // }
    this.state = {
      // this is just temporary values
      line :null,
      cards: [
              {_id: "kiss", title:"title1", date:"november 4 2018"},
              {_id: "heaven", title:"title2", date:"december 15 2018"},
              {_id: "demons", title:"title3", date:"september 30 2018"},
              {_id: "loveones", title:"title4", date:"september 26 2018"},
              {_id: "pain", title:"title5", date:"september 1 2018"}
            ]
    };
  }

  // lineGenerator = d3.line();
  // static getDerivedStateFromProps(props){
  //   // this.lineGenerator(data);
  //
  //   // return {line:this.lineGenerator};
  //   return null;
  // }
  render(){
    return (
      <div>
        <div className="header-box">
          <h1 className="heading__primary heading__primary--pink u-mt-sm ">Remember</h1>
        </div>

        <div className="xcontainer-main u-mb-md">
            <div className="topcards">
              <h4 className="heading__quaternary u-mb-sm">Top Five Cards </h4>
              <ul className="list">
                 {
                    this.state.cards.map( function(master, index){
                      return ( <TopFiveCard key={master._id} cards={master}/>  );
                    })
                 }
               </ul>
            </div>

              <Chart data={data}/>
        </div>
        <CreateMaster/>

      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    test: state.test
  };
}
export default connect(mapStateToProps, null)(MasterCard);

// <div className="create">
//   <h4 className="heading__quaternary u-sb-md">Create Main Cards</h4>
//
//
//   <div className="create__contrainer ">
//     <div className="create__cards  u-mb-sm">
//
//       <div className="create__field">
//         <input onChange={(event) => this.setState( {title:event.target.value} )} type="text" value={this.state.title} id="title" className="input__master-title" maxLength="32" />
//       </div>
//
//       <div className="create__cta u-mb-sm">
//         <Link to={`/main/subcards/${this.state.title}`} className="create__cta-btn "> Create Master Card </Link>
//       </div>
//     </div>
//   </div>
// </div>
