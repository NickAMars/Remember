// import axios from 'axios';
import * as type from '../actions/types';
// const poolcards =
export default {


  getPoolCards: (pathname)=>{
   return async dispatch => {
      // const res = await axios.get('/api/PoolCards');POOLCARDS
      const res= await "pool of cards that are public"
      dispatch( {type: type.POOLCARDS, payload: res.data } );
    }
  }
}


/*
 need to make the card deletable after, 1 days in the pool
*/

//,
 // put all master cards into a pool to be view by each user // havent created the pool yet in the server side
// publicMaster : (newCard)=>{
//   return async dispatch =>{
//      const res = await axios.put('/api/profile/MasterCard', newCard);
//      dispatch( {type: type.PUBLIC_MASTER, payload: res.data } );
//   }
// }
