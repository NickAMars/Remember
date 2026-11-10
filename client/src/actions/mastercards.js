import axios from '../utils/api';
import * as type from '../actions/types';
import { showToast } from '../utils/toast';
export default {
  getMyCard : (id)=> async dispatch => {
    try {
      const res = await axios.get(`/api/profile/MasterCard/${id}`);
      return res.data.progress;
    } catch (err) {
      showToast(err.response ? err.response.data.error : 'Failed to load card');
    }
  },

  getMyCards : (pathname)=> async dispatch => {
    try {
      const res = await axios.get('/api/profile/MasterCard');
      dispatch( {type: type.MYCARDS, payload: res.data } );
    } catch (err) {
      showToast(err.response ? err.response.data.error : 'Failed to load cards');
    }
  },
  updateMaster : (id,newCard)=> async dispatch => {
    try {
      const res = await axios.put(`/api/profile/MasterCard/${id}`, newCard);
      dispatch( {type: type.UPDATE_MASTER, payload: res.data } );
      showToast(`"${newCard.title}" updated successfully`);
    } catch (err) {
      showToast(err.response ? err.response.data.error : `Failed to update "${newCard.title}"`);
    }
  },
  deleteMaster : (id, title)=>
  async dispatch => {
    try {
      await axios.delete( `/api/profile/MasterCard/${id}` );
      dispatch( {type: type.DELETE_MASTER, payload: id} );
      showToast(`"${title}" deleted successfully`);
    } catch (err) {
      showToast(err.response ? err.response.data.error : `Failed to delete "${title}"`);
    }
  },
  getMasterTime : (id,time)=>
  async dispatch => {
    try {
      const res = await axios.put( `/api/profile/MasterCard/time/${id}`,{time} );
      dispatch( {type: type.UPDATE_TIME, payload: res.data} );
    } catch (err) {
      showToast(err.response ? err.response.data.error : 'Failed to save time');
    }
  },
  submitCard : (title, cards)=>
    async dispatch => {
      try {
        let data = { title , cards };
        const res = await axios.post('/api/profile/MasterCard',data);
        dispatch( {type: type.UPDATE_TIME, payload: res.data } );
        showToast(`"${title}" created successfully`);
      } catch (err) {
        showToast(err.response ? err.response.data.error : `Failed to create "${title}"`);
      }
    }

}
