import axios from 'axios';
import * as type from '../actions/types';
export default {
  getMyCard : (id)=> async dispatch => {
      const res = await axios.get(`/api/profile/MasterCard/${id}`);
      return res.data.progress;
  },

  getMyCards : (pathname)=> async dispatch => {
      const res = await axios.get('/api/profile/MasterCard');
      dispatch( {type: type.MYCARDS, payload: res.data } );

  },
  // it should render after the action creater is finish
  updateMaster : (id,newCard)=> async dispatch => {
      const res = await axios.put(`/api/profile/MasterCard/${id}`, newCard);
      dispatch( {type: type.UPDATE_MASTER, payload: res.data } );
  },
  deleteMaster : (id)=>
  async dispatch => {
      await axios.delete( `/api/profile/MasterCard/${id}` );
      // console.log("Successfully deleted this card");
       dispatch( {type: type.DELETE_MASTER, payload: id} );
  },
  getMasterTime : (id,time)=>
  async dispatch => {
    const res = await axios.put( `/api/profile/MasterCard/time/${id}`,{time} );
    // console.log(res);
       dispatch( {type: type.UPDATE_TIME, payload: res.data} );
  },
  submitCard : (title, cards)=>
    async dispatch => {//put instead of post
     let data = { title , cards };
      const res =  await axios.post('/api/profile/MasterCard',data);
     dispatch( {type: type.UPDATE_TIME, payload: res.data } );
    }

}
