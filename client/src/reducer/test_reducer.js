import { TEST_CARD, SUBMIT_CARD, DELETE_MASTER,MASTER_FORM}  from '../actions/types';
//
//
// // why doesnt this update the store

// This method is use just to test my server
export default  function (state = {}, action) {
  switch(action.type){
    case MASTER_FORM:
      // console.log(action.payload);
    return action.payload;
    case DELETE_MASTER:
    // do a filter removing the one with the id from the list
      return {id:`Working ${action.payload}`};
    case TEST_CARD:
      return {id:action.payload};
    case SUBMIT_CARD:
      return {id:action.payload};
    default:
      return state;
  }
}
