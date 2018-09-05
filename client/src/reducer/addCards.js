import { ADD_CARD } from '../actions';


/*
  @params [] {}
*/
export default  function (state = [], action) {
  switch(action.type){
    case ADD_CARD:
    return [...state, action.payload];
    default:
    return state;
  }
}

/*
need to find a way that i can convert an array
 to an object which would make it faster to get
  access to update and delete the card

*/
