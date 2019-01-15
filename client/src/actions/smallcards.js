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
  },
  submitCard : async(title, cards)=>{
  let data = { title , cards };
   // return async dispatch => {
       await axios.post('/api/profile/MasterCard',data);
      // console.log(res)
      // dispatch( {type: type.SUBMIT_CARD, payload: res.data } );
    // }
  }

}
