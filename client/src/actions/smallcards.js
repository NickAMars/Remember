 import axios from '../utils/api';
import * as type from '../actions/types';
// Initially making all the small cards
// const smallcards=
export default {// subCardRouts
  getSmallCards : (id, { page, pageSize, search } = {}) =>{
    return async dispatch => {
      try {
       const params = {};
       if (page !== undefined) params.page = page;
       if (pageSize !== undefined) params.pageSize = pageSize;
       if (search) params.search = search;
       const res = await axios.get(`/api/profile/MasterCard/${id}/subcards`, { params });
       const data = res.data || {};
       dispatch( {type: type.GET_SUBCARDS, payload: data.items || data, total: data.total } );
      } catch (err) {
        console.error('getSmallCards failed', err);
        dispatch( {type: type.GET_SUBCARDS, payload: [], total: 0 } );
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
