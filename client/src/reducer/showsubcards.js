import { GET_SUBCARDS } from '../actions/types';

/** The cards on the current page of the open deck, plus the total. */
const initialState = { items: [], total: 0 };

export default function showSubCardsReducer(state = initialState, action) {
  switch (action.type) {
    case GET_SUBCARDS: {
      const cards = Array.isArray(action.payload) ? action.payload : [];
      return { items: cards, total: action.total !== undefined ? action.total : cards.length };
    }
    default:
      return state;
  }
}
