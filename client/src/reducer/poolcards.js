import {POOLCARDS}  from '../actions/types';
// get the pool cards
export default  function (state = [], action) {
  switch(action.type){
    case POOLCARDS:
      return action.payload;
    default:
      return state;
  }
}
