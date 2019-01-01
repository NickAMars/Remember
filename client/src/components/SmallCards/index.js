import React, {Component} from 'react';
import { connect } from 'react-redux';
// import {Header} from '../Header';
// import {Card} from './Card';
import {SubCard} from '../Helper/Cards';

// dummy date
const dummy = [ {id:"kiss", title:"more love", description:"november 2,2017"},
                {id:"love", title:"more Parent", description:"september 4, 2013"},
                {id:"No", title:"more Conflict", description:"september 16, 2018"},
                {id:"Dreams", title:"more Realize", description:"March 14, 2018"}
            ];
class SmallCards extends Component{
  constructor(props){
    super(props)
    this.state = {
      time: 0,
      current: Date.now()
    }
    // console.log(this.state.current)
  }
  componentDidMount(){
    // console.log("Normal",this.state.current)
    // START TIMER (when on a single card)
    this.timer =  setInterval( ()=>
      this.setState({ time : Date.now() - this.state.current})
    , 1)

  }

  // using the props called by mine and more cards
  // to get the cards which are filling this field
  render(){
    return (
      <div className="remember">
        <div className="header-box">
          <h1 className="heading__primary heading__primary--pink u-mt-sm ">Remember</h1>
        </div>
      {/*  < Header />*/}
        <hr className="u-mt-sm u-mb-sm"/>
        <div className="row">
        {
         /*creating card components*/
         dummy.map((smallcard, index) => {
           return (<SubCard  key={smallcard.id}  {...smallcard} />);
         })
        }
        </div>
      </div>
    );
  }

componentWillUnmount(){
  //END TIMER (use action creater to send the time to the master card)
  // console.log(this.state.time)
  clearInterval( this.timer );
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
