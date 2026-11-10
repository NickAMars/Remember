 import axios from '../utils/api';
import * as type from '../actions/types';
// Initially making all the small cards
// const smallcards=
export default {// subCardRouts
  getSmallCards : (id) =>{
    return async dispatch => {
      try {
       const res = await axios.get(`/api/profile/MasterCard/${id}/subcards`);
       dispatch( {type: type.GET_SUBCARDS, payload: res.data || [] } );
      } catch (err) {
        console.error('getSmallCards failed', err);
        dispatch( {type: type.GET_SUBCARDS, payload: [] } );
      }
     }
  },
  addCard : (card)=>{
    return {
      type: type.ADD_CARD,
      payload: card
    };
  },
  deleteCard : (id)=>{
    return {
    type: type.DELETE_CARD,
    payload: id
    }
  },
  updateCard : (newCard)=>{
    return {
    type: type.UPDATE_CARD,
    payload: newCard
    }
  },
  updateForm : (newCard)=>{
    return {
    type: type.UPDATE_FORM,
    payload: newCard
    }
  }


}
