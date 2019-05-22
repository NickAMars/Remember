import React, {Component} from 'react';
import {TopFiveCard} from '../Helper/Cards';
import {CreateMaster} from '../Helper/Form';
import {Chart} from  './chart';
import { connect } from 'react-redux';
import { fetchUser ,getMyCard } from '../../actions';

class MasterCard extends Component{
  async componentDidMount(){
   await this.props.fetchUser();
   // console.log("fetchUSer")
   // console.log(this.props)
   // console.log("/main : ",this.props)
  }
  constructor(props){
    super(props);

    this.state = {
      line :null,
      data : [],
      cards: []
    };
  }

  getDataFromTopFive = async (oneTopFive) => {
    let data = await this.props.getMyCard(oneTopFive);
    this.setState({data});
  }

  static getDerivedStateFromProps(props, state){
    // console.log(props.user);
    if(props.user === null) return null;
    // console.log(props.user)
    if(props.user){
      return{ cards : props.user.topfiveMaster};
    }else{
      console.log("null")
      return null;
    }
  }
  render(){
    // console.log(this.props.user);
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
                   this.state.cards.map( (master, index) =>{
                      return ( <TopFiveCard onClick={this.getDataFromTopFive} key={master.referenceID} cards={master}/>  );
                    })
                 }
               </ul>
            </div>

              <Chart data={this.state.data}/>
        </div>
        <CreateMaster/>

      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    test: state.test,
    master_card: state.master_card,
    user: state.user
  };
}
export default connect(mapStateToProps, {fetchUser, getMyCard})(MasterCard);
