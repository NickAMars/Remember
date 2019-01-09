 import axios from 'axios';
import * as type from '../actions/types';
// Initially making all the small cards
// const smallcards=
export default {

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
  },
  submitCard : (title, cards)=>{
  let data = { title , cards };
  // console.log(data);
   return async dispatch => {
      const res = await axios.post('/api/profile/MasterCard',data);
      dispatch( {type: type.SUBMIT_CARD, payload: res.data } );
    }
  }

}
