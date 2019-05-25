import React,{Component} from 'react'
import { connect } from 'react-redux'
import  {MasterCard} from '../Helper/Cards'
import {MasterForm,SearchBar} from '../Helper/Form'
import {showMasterForm} from '../../actions';
class Mine extends Component{
  //
  constructor(props){
    super(props)
    this.state ={
      visible: false,
      searchBar:"search",
      title: "",
      _id:"",
      cards:[]
    }
  }
static getDerivedStateFromProps(nextProps, state){
  const {pathname, master, poolcards} = nextProps
  if(pathname === '/mine'){
    return{cards: [...master] };
  }else if(pathname === '/more'){
    return {cards: [...poolcards] };
  }else{
    return null;
  }
}

poolCardMatchUser(poolcard){
  if(this.props.user !== null)
  if(this.props.user._id === poolcard.author)
    return true;
  else
    return false;
}


 render(){
    const {visible,_id, title} =this.state;
    const {pathname} = this.props;
   return (
     <div className="remember">
       <div className="header-box">
         <h1 className="heading__primary heading__primary--pink u-mt-sm ">Remember</h1>
       </div>
       <SearchBar/>
       {
        visible ?
          <MasterForm title={title} _id={_id} toggleMasterForm ={this.toggleMasterForm}/>
          : <noscript/>
       }
       <div className="master">
         <ul className="master__container">
          {
            this.state.cards.map(elem =>
               <MasterCard
               key={elem._id}
               masterinfo={elem}
               visible={this.props.visible}
               showMasterForm={this.showMasterForm}
               toggleMasterForm={this.toggleMasterForm}
               pathname={pathname}
               showCheckBox={this.poolCardMatchUser(elem)}
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
  return {
    poolcards: state.poolcards,
    master: state.master_card,
    user: state.user
  };
}

export default connect(mapStateToProps,{showMasterForm})(Mine);
// {getMyCards}


// this.props.user._id === this.props.author
