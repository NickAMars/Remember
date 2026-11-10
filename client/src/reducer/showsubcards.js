import { GET_SUBCARDS }  from '../actions/types';

const initialState = { items: [], total: 0 };

export default  function (state = initialState, action) {
  switch(action.type){
    case GET_SUBCARDS:
    return { items: action.payload, total: action.total !== undefined ? action.total : (action.payload || []).length };
    default:
      return state;
  }
}
