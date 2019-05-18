import React, {Component} from 'react';
import {TopFiveCard} from '../Helper/Cards';
import {CreateMaster} from '../Helper/Form';
import {Chart} from  './chart';
import { connect } from 'react-redux';
import { fetchUser ,getMyCard } from '../../actions';
// import {data} from  '../../constance'
// import * as d3 from "d3"

// import {data} from  '../../constance'
class MasterCard extends Component{
  componentDidMount(){
    // this.props.serverTest();
   // call action creater which places the result into the state
   this.props.fetchUser();
  }
  constructor(props){
    super(props);
    // this.state={
    //
    // }
    this.state = {
      // this is just temporary values
      line :null,
      data : [],
      cards: []
    };
  }

  // lineGenerator = d3.line();
  // static getDerivedStateFromProps(props){
  //   // this.lineGenerator(data);
  //
  //   // return {line:this.lineGenerator};
  //   return null;
  // }
  getDataFromTopFive = async (oneTopFive) => {
    // console.log("id",oneTopFive);
    let data = await this.props.getMyCard(oneTopFive);
    this.setState({data});
    // console.log("data ", this.state.data);
  }

  static getDerivedStateFromProps(props, state){
    if(props.user){
      return{ cards : props.user.topfiveMaster};
    }else{
      return null;
    }
  }
  render(){
    // console.log(this.props);
    // this.getDataFromTopFive("ASDf");
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
