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
      // for(let i=0;i < state.length; i++ )
      //   if(state[i]._id === action.payload._id)
      //     state[i] = action.payload;
      // UPDATED at the beginning
    return [action.payload,...state.filter(card=> card._id !== action.payload._id)];
    case DELETE_MASTER:
      return state.filter(elem => elem.id !== action.payload);
    case  UPDATE_TIME:
      return action.payload;
    default:
      return state;
  }
}
