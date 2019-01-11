import { MYCARDS,  SUBMIT_CARD, DELETE_MASTER,
UPDATE_MASTER}  from '../actions/types';
//
//  MASTER_FORM,
// // why doesnt this update the store

// This method is use just to test my server
export default  function (state = [], action) {
  switch(action.type){
    case MYCARDS:
    // console.log(action.payload)
    return action.payload;
    case UPDATE_MASTER:
      // for(let i=0;i < state.length; i++ )
      //   if(state[i]._id === action.payload._id)
      //     state[i] = action.payload;
    return [...state.filter(card=> card._id !== action.payload._id),action.payload];
    case DELETE_MASTER:
      return state.filter(elem => elem.id !== action.payload._id);
    // case TEST_CARD:
    //   return {id:action.payload};
    case SUBMIT_CARD:
      return {id:action.payload};
    default:
      return state;
  }
}
