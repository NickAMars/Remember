import { MYCARDS, DELETE_MASTER, UPDATE_TIME, UPDATE_MASTER, ADD_MASTER } from '../actions/types';

/** The user's decks for the current page, plus the total across all pages. */
const initialState = { items: [], total: 0 };

export default function masterCardReducer(state = initialState, action) {
  switch (action.type) {
    case MYCARDS: {
      const decks = Array.isArray(action.payload) ? action.payload : [];
      return { items: decks, total: action.total !== undefined ? action.total : decks.length };
    }
    case ADD_MASTER: {
      if (!action.payload || !action.payload.uuid) return state;
      const others = state.items.filter(deck => deck.uuid !== action.payload.uuid);
      return { items: [action.payload, ...others], total: state.total + 1 };
    }
    case UPDATE_MASTER: {
      const updated = action.payload;
      const items = state.items.map(deck => (deck.uuid === updated.uuid ? { ...deck, ...updated } : deck));
      return { items, total: state.total };
    }
    case DELETE_MASTER:
      return {
        items: state.items.filter(deck => deck.uuid !== action.payload),
        total: Math.max(0, state.total - 1),
      };
    case UPDATE_TIME: {
      // Bug fix: saving study time used to wipe the deck list. Now only that deck's total changes.
      const { uuid, timespent } = action.payload || {};
      if (!uuid) return state;
      return { ...state, items: state.items.map(deck => (deck.uuid === uuid ? { ...deck, timespent } : deck)) };
    }
    default:
      return state;
  }
}
