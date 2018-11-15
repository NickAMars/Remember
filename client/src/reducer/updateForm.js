import { UPDATE_FORM }  from '../actions/types';


// send a true value to the form field which  display icon button to update card
// @params boolean , card
export default  function (state = {}, action) {
  switch(action.type){
    case UPDATE_FORM:
    // @params boolean , card
    return action.payload;
      //return [...state, action.payload];
    default:
      return state;
  }
}
