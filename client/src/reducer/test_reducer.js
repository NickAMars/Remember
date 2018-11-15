import { TEST_CARD, SUBMIT_CARD}  from '../actions/types';
//
//
// // why doesnt this update the store

// This method is use just to test my server
export default  function (state = "", action) {
  switch(action.type){
    case TEST_CARD:
      return action.payload;
    case SUBMIT_CARD:
      return action.payload;
    default:
      return state;
  }
}
