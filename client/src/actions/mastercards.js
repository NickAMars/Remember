import axios from 'axios';
import * as type from '../actions/types';
// show the master form when wanting to update the public field
// const mastercards =
export default {
  showMasterForm : (flag, idMaster, title)=>{
    return {
    type: type.MASTER_FORM,
    payload: {visible: flag, id: idMaster, title}
    }
  },
  getMyCards : (pathname)=> async dispatch => {
      const res = await axios.get('/api/profile/MasterCard');
      dispatch( {type: type.MYCARDS, payload: res.data } );

  },
  updateMaster : (id,newCard)=> async dispatch => {
      await axios.put(`/api/profile/MasterCard/${id}`, newCard);
      dispatch( {type: type.UPDATE_MASTER, payload: newCard } );
  },
  deleteMaster : (id)=> async dispatch => {
       await axios.delete( `/api/profile/MasterCard/${id}` );
       dispatch( {type: type.DELETE_MASTER, payload: id} );
  }


}
