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

  getMyCards : (pathname)=> async dispatch => {
      const res = await axios.get('/api/profile/MasterCard');
      // console.log(res);
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
       dispatch( {type: type.DELETE_MASTER, payload: id} );
  }
}
