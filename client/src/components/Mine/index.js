import React,{Component} from 'react'
import { connect } from 'react-redux'
// import { getMyCards} from '../../actions'
// import {Header} from '../Header';

// import
// ,MasterCards
// import  { SearchBar} from './Fields'
import  {MasterCard} from '../Helper/Cards'
import {MasterForm,SearchBar} from '../Helper/Form'
import {showMasterForm} from '../../actions';
//* as actions
// must keep track of state
// let visible = false;
class Mine extends Component{
  //
  constructor(props){
    super(props)
    // console.log(props);
    this.state ={
      visible: false,
      searchBar:"search",
      title: "",
      _id:""
    }
  }

 render(){
    const master = this.props.master;
    const {visible,_id, title} =this.state;
    // console.log(master);
   return (
     <div className="remember">
       <div className="header-box">
         <h1 className="heading__primary heading__primary--pink u-mt-sm ">Remember</h1>
       </div>
       {/*< Header />*/}
       <SearchBar/>
       {
        visible ?
          <MasterForm title={title} _id={_id} toggleMasterForm ={this.toggleMasterForm}/>
          : <noscript/>
       }
       <div className="master">
         <ul className="master__container">
          {
            master.map(elem =>
               <MasterCard
               key={elem._id}
               masterinfo={elem}
               visible={this.props.visible}
               showMasterForm={this.showMasterForm}
               toggleMasterForm={this.toggleMasterForm}
               />
             )
          }

         </ul>
       </div>
     </div>
   );
 }
 showMasterForm  = (_id,title) => {
   this.setState({title, _id});
 }
 toggleMasterForm = () =>{
   this.setState({visible:!this.state.visible});
 }
}
const mapStateToProps = (state) => {
  // console.log(state.master_card)
  return {
    master: state.master_card
  };
}

export default connect(mapStateToProps,{showMasterForm})(Mine);
// {getMyCards}
