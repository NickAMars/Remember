import {
  MYCARDS,
 DELETE_MASTER,
 UPDATE_TIME,
 UPDATE_MASTER}  from '../actions/types';

const initialState = { items: [], total: 0 };

function normalize(data) {
  if (data && data.items) return { items: data.items, total: data.total || data.items.length };
  if (Array.isArray(data)) return { items: data, total: data.length };
  return initialState;
}

export default function (state = initialState, action) {
  switch(action.type){
    case MYCARDS: {
      const items = action.payload;
      const total = action.total !== undefined ? action.total : (Array.isArray(items) ? items.length : 0);
      return { items: Array.isArray(items) ? items : [], total };
    }
    case UPDATE_MASTER: {
      const updated = action.payload;
      const newItems = [updated, ...state.items.filter(card => card.uuid !== updated.uuid)];
      return { items: newItems, total: state.total };
    }
    case DELETE_MASTER: {
      const newItems = state.items.filter(card => card.uuid !== action.payload);
      return { items: newItems, total: Math.max(0, state.total - 1) };
    }
    case UPDATE_TIME:
      return normalize(action.payload);
    default:
      return state;
  }
}
