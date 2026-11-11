import axios, { errorMessage } from '../utils/api';
import * as type from '../actions/types';
import { showToast } from '../utils/toast';
export default {

  getPoolCards: ()=>{
   return async dispatch => {
     try {
      const response = await axios.get('/api/poolcards');
      dispatch( {type: type.POOLCARDS, payload: response.data} );
     } catch (error) {
      showToast(errorMessage(error, 'Failed to load public cards'));
     }
    }
  },
  addPoolCard: (mastercard)=>{
   return async dispatch => {
     try {
      const response = await axios.post('/api/poolcards', {mastercard: { uuid: mastercard.uuid }});
      dispatch( {type: type.POOLCARDS, payload: response.data} );
      showToast('Card shared publicly');
     } catch (error) {
      showToast(errorMessage(error, 'Failed to share card'));
     }
    }
  },
  deletePoolCard: (publicDeckUuid)=>{
   return async dispatch => {
     try {
      const response = await axios.delete(`/api/poolcards/${publicDeckUuid}`);
      dispatch( {type: type.POOLCARDS, payload: response.data} );
      showToast('Card unshared');
     } catch (error) {
      showToast(errorMessage(error, 'Failed to unshare card'));
     }
    }
  },
  getPoolSubCard: (publicDeckUuid)=>{
    return async dispatch => {
      try {
       const response = await axios.get(`/api/poolcards/${publicDeckUuid}`);
       dispatch( {type: type.GET_SUBCARDS, payload: response.data} );
      } catch (error) {
       showToast(errorMessage(error, 'Failed to load cards'));
      }
     }
  },
  storePoolToMaster: (publicDeckUuid)=>{
    return async dispatch => {
      try {
       const response = await axios.post(`/api/poolcards/add/${publicDeckUuid}`);
       // Bug fix: the copied deck used to replace the whole deck list.
       dispatch( {type: type.ADD_MASTER, payload: response.data} );
       showToast('Card copied to Study');
      } catch (error) {
       showToast(errorMessage(error, 'Failed to copy card'));
      }
     }
  }
}
