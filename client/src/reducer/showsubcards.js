import { GET_SUBCARDS }  from '../actions/types';


// send a true value to the form field which  display icon button to update card
// @params boolean , card
export default  function (state = [], action) {
  switch(action.type){
    case GET_SUBCARDS:
    return action.payload;
    default:
      return state;
  }
}
