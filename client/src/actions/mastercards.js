import axios from 'axios';
import * as type from '../actions/types';
// show the master form when wanting to update the public field
// const mastercards =
export default {
  // showMasterForm : (flag, idMaster, title)=>{
  //   // need to update the form not the master information
  //
  //   // return {
  //   // type: type.MASTER_FORM,
  //   // payload: {visible: flag, id: idMaster, title}
  //   // }
  // },
  getMyCard : (id)=> async dispatch => {
    // console.log(id, "in he action");
      const res = await axios.get(`/api/profile/MasterCard/${id}`);
      // console.log(res.data.progress);

      return res.data.progress;
      // dispatch( {type: type.MYCARDS, payload: res.data } );
      // return

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
      const res= await axios.delete( `/api/profile/MasterCard/${id}` );
      console.log(res);
       dispatch( {type: type.DELETE_MASTER, payload: id} );
  },
  getMasterTime : (id,time)=>
  async dispatch => {
    const res = await axios.put( `/api/profile/MasterCard/time/${id}`,{time} );
       dispatch( {type: type.UPDATE_TIME, payload: res.data} );
  },
  submitCard : (title, cards)=>
    async dispatch => {//put instead of post
     let data = { title , cards };
      const res =  await axios.post('/api/profile/MasterCard',data);
     dispatch( {type: type.UPDATE_TIME, payload: res.data } );
    }

}
