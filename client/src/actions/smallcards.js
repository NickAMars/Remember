 import axios from 'axios';
import * as type from '../actions/types';
// Initially making all the small cards
// const smallcards=
export default {// subCardRouts
  getSmallCards : (id) =>{
    return async dispatch => {
       const res = await axios.get(`/api/profile/MasterCard/${id}`);
       dispatch( {type: type.GET_SUBCARDS, payload: res.data } );
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
