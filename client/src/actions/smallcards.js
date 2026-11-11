import axios from '../utils/api';
import * as type from '../actions/types';
/** Cards ("sub cards") inside a deck. */
export default {
  getSmallCards : (deckUuid, { page, pageSize, search, shuffle } = {}) =>{
    return async dispatch => {
      try {
       const params = {};
       if (page !== undefined) params.page = page;
       if (pageSize !== undefined) params.pageSize = pageSize;
       if (search) params.search = search;
       if (shuffle) params.shuffle = 'true';
       const response = await axios.get(`/api/profile/MasterCard/${deckUuid}/subcards`, { params });
       const data = response.data || {};
       dispatch( {type: type.GET_SUBCARDS, payload: data.items || data, total: data.total } );
      } catch (error) {
        console.error('getSmallCards failed', error);
        dispatch( {type: type.GET_SUBCARDS, payload: [], total: 0 } );
      }
     }
  },
  /** Empty the card list, so the previous deck's cards don't show while a new deck loads. */
  clearSubCards: () => ({ type: type.GET_SUBCARDS, payload: [], total: 0 }),
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
