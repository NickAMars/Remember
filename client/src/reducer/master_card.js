import {
  MYCARDS,
 DELETE_MASTER,
 UPDATE_TIME,
 UPDATE_MASTER}  from '../actions/types';
//SUBMIT_CARD,
//  MASTER_FORM,
// // why doesnt this update the store

// This method is use just to test my server
export default  function (state = [], action) {
  // console.log(action.payload);
  switch(action.type){
    case MYCARDS:
    return action.payload;
    case UPDATE_MASTER:
    return [action.payload,...state.filter(card=> card._id !== action.payload._id)];
    case DELETE_MASTER:
      return state.filter(card => card._id !== action.payload);
    case  UPDATE_TIME:
      return action.payload;
    default:
      return state;
  }
}
