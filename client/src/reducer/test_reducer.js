import { TEST_CARD, SUBMIT_CARD, DELETE_MASTER}  from '../actions/types';
//
//
// // why doesnt this update the store

// This method is use just to test my server
export default  function (state = "", action) {
  switch(action.type){
    case DELETE_MASTER:
      console.log(action.payload);
    // do a filter removing the one with the id from the list
      return `Working ${action.payload}`;
    case TEST_CARD:
      return action.payload;
    case SUBMIT_CARD:
      return action.payload;
    default:
      return state;
  }
}
