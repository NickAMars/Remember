import React, {PureComponent} from 'react';
import { connect } from 'react-redux';
import {SubCard} from '../Helper/Cards';


class SmallCards extends PureComponent{

  constructor(props){
    super(props)
    this.state = {
      time: 0,
      current: Date.now()
    }
    console.log(props);
  }
  componentDidMount(){
    this.timer =  setInterval( ()=>
      this.setState({ time : Date.now() - this.state.current})
    , 1)
  }

  render(){
    return (
      <div className="remember">
        <div className="header-box">
          <h1 className="heading__primary heading__primary--pink u-mt-sm ">Remember</h1>
        </div>
        <hr className="u-mt-sm u-mb-sm"/>
        <div className="row">
        {
         /*creating card components*/
         this.props.showsubcards.map((smallcard, index) => <SubCard  key={smallcard._id}  {...smallcard} />)
        }
        </div>
      </div>
    );
  }

componentWillUnmount(props){
  clearInterval( this.timer );
}

}
export const mapStateToProps = (state) => {
  return {
    smallcards: state.smallcards,
    showsubcards: state.showsubcards
  };
}

export default connect(mapStateToProps)(SmallCards);



// {
//  /*creating card components*/
//  this.props.smallcards.map((smallcard, index) => {
//    return (<Card  key={smallcard.id}  {...smallcard} />);
//  })
// }
