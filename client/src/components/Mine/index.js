import React,{Component} from 'react'
import { connect } from 'react-redux'
// import { getMyCards} from '../../actions'
// import {Header} from '../Header';

// import
// ,MasterCards
// import  { SearchBar} from './Fields'
import  {MasterCard} from '../Helper/Cards'
import {MasterForm,SearchBar} from '../Helper/Form'
//* as actions
// must keep track of state



// dummy date
const dummy = [ {id:"kiss", title:"Toni", date:"november 2,2017"},
                {id:"love", title:"Parent", date:"september 4, 2013"},
                {id:"No", title:"Conflict", date:"september 16, 2018"},
                {id:"Dreams", title:"Realize", date:"March 14, 2018"}
            ];
class Mine extends Component{

  constructor(props){
    super(props)
    console.log(props);
  }

 render(){
    // console.log(this.props);
   return (
     <div className="remember">
       <div className="header-box">
         <h1 className="heading__primary heading__primary--pink u-mt-sm ">Remember</h1>
       </div>
       {/*< Header />*/}
       <SearchBar/>
       <MasterForm/>
       <div className="master">
         <ul className="master__container">
          {
            dummy.map(elem =>
               <MasterCard
               key={elem.id}
               masterinfo={elem}
               visible={this.props.visible}
               />)
          }

         </ul>
       </div>
     </div>
   );
 }
}
const mapStateToProps = (state) => {
  return {
    test: state.master_card
  };
}

export default connect(mapStateToProps)(Mine);
// {getMyCards}
