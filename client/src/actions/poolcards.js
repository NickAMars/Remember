import axios from 'axios';
import * as type from '../actions/types';
export default {


  getPoolCards: (pathname)=>{
   return async dispatch => {
      const res = await axios.get('/api/poolcards');//POOLCARDS
      dispatch( {type: type.POOLCARDS, payload: res.data} );
    }
  },
  addPoolCard: (mastercard)=>{
   return async dispatch => {
      const res = await axios.post('/api/poolcards', {mastercard});//POOLCARDS
      dispatch( {type: type.POOLCARDS, payload: res.data} );
    }
  },
  deletePoolCard: (id)=>{
   return async dispatch => {
      const res = await axios.delete(`/api/poolcards/${id}`);
      console.log(res.data)
      dispatch( {type: type.POOLCARDS, payload: res.data} );
    }
  },
  getPoolSubCard: (id)=>{
    return async dispatch => {
       const res = await axios.get(`/api/poolcards/${id}`);
           console.log(res.data);
       dispatch( {type: type.GET_SUBCARDS, payload: res.data} );
     }
  }
}
