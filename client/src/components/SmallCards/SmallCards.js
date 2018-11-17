import React, {Component} from 'react';
import { connect } from 'react-redux';
import {Header} from '../Header';
import {Card} from './Card';

// dummy date
const dummy = [ {id:"kiss", title:"more love", description:"november 2,2017"},
                {id:"love", title:"more Parent", description:"september 4, 2013"},
                {id:"No", title:"more Conflict", description:"september 16, 2018"},
                {id:"Dreams", title:"more Realize", description:"March 14, 2018"}
            ];
class SmallCards extends Component{

  // using the props called by mine and more cards
  // to get the cards which are filling this field
  render(){
    return (
      <div className="remember">
        <div className="header-box">
          <h1 className="heading__primary heading__primary--pink u-mt-sm ">Remember</h1>
        </div>
        < Header />
        <hr className="u-mt-sm u-mb-sm"/>
        <div className="row">
        {
         /*creating card components*/
         dummy.map((smallcard, index) => {
           return (<Card  key={smallcard.id}  {...smallcard} />);
         })
        }
        </div>
      </div>
    );
  }

// so when leaving the page update the database if i made any changes 
  componentWillUnmount(){
    console.log("leaving the smallCard");
  }
}
export const mapStateToProps = (state) => {
  return {
    smallcards: state.smallcards
  };
}

export default connect(mapStateToProps)(SmallCards);



// {
//  /*creating card components*/
//  this.props.smallcards.map((smallcard, index) => {
//    return (<Card  key={smallcard.id}  {...smallcard} />);
//  })
// }
