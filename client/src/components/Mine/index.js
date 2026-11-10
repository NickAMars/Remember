import React,{Component} from 'react'
import { connect } from 'react-redux'
import  {MasterCard} from '../Helper/Cards'
import {MasterForm,SearchBar} from '../Helper/Form'
import {CardSizeControl} from '../CardSizeControl'
import {showMasterForm, getPoolCards} from '../../actions';
class Mine extends Component{
  //
  constructor(props){
    super(props)
    this.state ={
      visible: false,
      search: "",
      title: "",
      uuid:"",
      cards:[]
    }
  }
  componentDidMount(){
    this.props.getPoolCards();
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
  if(this.props.user.uuid === poolcard.author)
    return true;
  else
    return false;
}


 render(){
    const {visible,uuid, title} =this.state;
    const {pathname} = this.props;
   return (
     <div className="remember">
       <SearchBar onSearch={(search) => this.setState({ search })}/>
       <div style={{ visibility: visible ? 'visible' : 'hidden' }}>
         <MasterForm title={title} _id={uuid} toggleMasterForm ={this.toggleMasterForm}/>
       </div>
       <CardSizeControl variant="master"/>
       <div className="master">
         <ul className="master__container">
          {
            this.state.cards
              .filter(elem => !this.state.search || elem.title.toLowerCase().includes(this.state.search.toLowerCase()))
              .map(elem =>
               <MasterCard
               key={elem.uuid}
               masterinfo={elem}
               visible={this.props.visible}
               showMasterForm={this.showMasterForm}
               toggleMasterForm={this.toggleMasterForm}
               pathname={pathname}
               showCheckBox={this.poolCardMatchUser(elem)}
               editingUuid={visible ? uuid : null}
               />
             )
          }

         </ul>
       </div>
     </div>
   );
 }
 showMasterForm  = (uuid,title) => {
   this.setState({title, uuid});
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

export default connect(mapStateToProps,{showMasterForm, getPoolCards})(Mine);
// {getMyCards}


// this.props.user._id === this.props.author
