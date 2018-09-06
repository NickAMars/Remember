import { ADD_CARD, DELETE_CARD, UPDATE_CARD } from '../actions';
// import _ from 'lodash';

/*
  @params [] {}
*/
export default  function (state = [], action) {
  switch(action.type){
    case ADD_CARD:
      return [...state, action.payload];
    case DELETE_CARD:
      return state.filter(obj=> obj.id !== action.payload);
    case UPDATE_CARD:
      return [...state.filter(obj=> obj.id !== action.payload.id),action.payload];
    default:
      return state;
  }
}
