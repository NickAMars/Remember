import { ADD_CARD } from '../actions';

export default  function (state=[], action) {
  switch(action.type){
    case ADD_CARD:
    return [...state, action.payload];
    default:
    return state;
  }
}
