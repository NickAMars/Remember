// import React,{Component} from 'react';
// // import { connect } from 'react-redux';
// import {Header} from '../Header';
// import {SearchBar} from './SearchBar';
// import {MasterCards} from './MasterCards';
// import { connect } from 'react-redux';
//
//
// 
// // must keep track of state
//
//
// // dummy date
// const dummy = [ {id:"kiss", title:"more love", date:"november 2,2017"},
//                 {id:"love", title:"more Parent", date:"september 4, 2013"},
//                 {id:"No", title:"more Conflict", date:"september 16, 2018"},
//                 {id:"Dreams", title:"more Realize", date:"March 14, 2018"}
//             ];
//
// export class More extends Component{
// ComponentDidMount(){
//   // console.log("props",this.props);
//   // call to get information from the data base
//   // There is also a redux life cycle method that can do this properly
// }
// // constructor(props){
// //   super(props);
// // }
//  render(){
//    // console.log(this.props);
//    return (
//      <div className="remember">
//        <div className="header-box">
//          <h1 className="heading__primary heading__primary--pink u-mt-sm ">Remember</h1>
//        </div>
//        < Header />
//        {/* SearchBar */}
//        <SearchBar/>
//
//        <div className="master">
//          <ul className="master__container">
//            {/* MasterCards */}
//           {
//             dummy.map(elem => <MasterCards key={elem.id} card={elem}/>)
//           }
//          </ul>
//        </div>
//      </div>
//    );
//  }
// }
// export const mapStateToProps = (state) => {
//   return {
//     test: state.test
//   };
// }
//
// export default connect(mapStateToProps)(More);
//   /*
//     componentDidUpdate(){}
//     @params prevProps, prevState, snapshot
//   */
// //ComponentWillUnMount(){}
