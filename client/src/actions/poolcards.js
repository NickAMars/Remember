import axios from '../utils/api';
import * as type from '../actions/types';
import { showToast } from '../utils/toast';
export default {

  getPoolCards: (pathname)=>{
   return async dispatch => {
     try {
      const res = await axios.get('/api/poolcards');
      dispatch( {type: type.POOLCARDS, payload: res.data} );
     } catch (err) {
      showToast(err.response ? err.response.data.error : 'Failed to load public cards');
     }
    }
  },
  addPoolCard: (mastercard)=>{
   return async dispatch => {
     try {
      const res = await axios.post('/api/poolcards', {mastercard: { uuid: mastercard.uuid }});
      dispatch( {type: type.POOLCARDS, payload: res.data} );
      showToast('Card shared publicly');
     } catch (err) {
      showToast(err.response ? err.response.data.error : 'Failed to share card');
     }
    }
  },
  deletePoolCard: (id)=>{
   return async dispatch => {
     try {
      const res = await axios.delete(`/api/poolcards/${id}`);
      dispatch( {type: type.POOLCARDS, payload: res.data} );
      showToast('Card unshared');
     } catch (err) {
      showToast(err.response ? err.response.data.error : 'Failed to unshare card');
     }
    }
  },
  getPoolSubCard: (id)=>{
    return async dispatch => {
      try {
       const res = await axios.get(`/api/poolcards/${id}`);
       dispatch( {type: type.GET_SUBCARDS, payload: res.data} );
      } catch (err) {
       showToast(err.response ? err.response.data.error : 'Failed to load cards');
      }
     }
  },
  storePoolToMaster: (id)=>{
    return async dispatch => {
      try {
       const res = await axios.post(`/api/poolcards/add/${id}`);
       dispatch( {type: type.MYCARDS, payload: res.data} );
       showToast('Card copied to Study');
      } catch (err) {
       showToast(err.response ? err.response.data.error : 'Failed to copy card');
      }
     }
  }
}
