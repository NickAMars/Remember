import React, {PureComponent} from 'react';
import { connect } from 'react-redux';
import {SubCard} from '../Helper/Cards';
import { getMasterTime} from '../../actions'

// This component constantly updates

class SmallCards extends PureComponent{

  constructor(props){
    super(props)
    this.state = {
      time: 0,
      current: Date.now(),
      prevent: true,
    }
  }
  componentDidMount(props){
    this.timer =  setInterval( ()=>
      this.setState({ time : Date.now() - this.state.current})
    , 1)
  }
static getDerivedStateFromProps(nextProps){
  if(nextProps.location.query){ // if query exist set the state to it
    const {prevent} = nextProps.location.query;

    return {prevent};
  }
  return null;
}
  // using the props called by mine and more cards
  // to get the cards which are filling this field
  render(){
    if(this.state.prevent)
      clearInterval( this.timer );
    console.log(this.props);
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

componentWillUnmount(){
  if(!this.state.prevent){
    this.props.getMasterTime(this.props.match.params.idMaster,this.state.time);
    clearInterval( this.timer );
  }
}

}
export const mapStateToProps = (state) => {
  return {
    smallcards: state.smallcards,
    showsubcards: state.showsubcards
  };
}

export default connect(mapStateToProps, {getMasterTime})(SmallCards);
