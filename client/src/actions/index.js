 import axios from 'axios';
import * as type from '../actions/types';


 export const serverTest = (newCard)=>{
  return async dispatch => {
     const res = await axios.get('/api/profile/MasterCard');
     dispatch( {type: type.TEST_CARD, payload: res.data } );
   }
 }

// get the id from the master card after submition of the update request
 export const updateMaster = (id,newCard)=>{
  return async dispatch => {
    // update the card in the database, so if the user visits the page again they
    // get the new information which is in the database
     await axios.put(`/api/profile/MasterCard/${id}`, newCard);
     dispatch( {type: type.UPDATE_MASTER, payload: newCard } );
   }
 }
 // get the value from the params
 export const deleteMaster = (id)=>{
  return async dispatch => {
    // remove the card form the database id the easy task
     await axios.delete(`/api/profile/MasterCard/${id}`);
     // Then we have to find the id of the card
     dispatch( {type: type.DELETE_MASTER, payload: id } );
   }
 }
 // put all master cards into a pool to be view by each user
 // havent created the pool yet in the server side
 export const publicMaster = (newCard)=>{
  return async dispatch => {
     const res = await axios.put('/api/profile/MasterCard', newCard);
     dispatch( {type: type.PUBLIC_MASTER, payload: res.data } );
   }
 }
export const addCard = (card)=>{
  // this process is never to go to the back end
  // i will use a cookie to store the cards so that when
  // the user refresh the screen all the cards arnt lost
  // will apply in the memory section
  return {
    type: type.ADD_CARD,
    payload: card
  };
}
export const deleteCard = (id)=>{
  return {
  type: type.DELETE_CARD,
  payload: id
  }
}
/*
  @param ID, Title, Description
*/
export const updateCard = (newCard)=>{
  return {
  type: type.UPDATE_CARD,
  payload: newCard
  }
}

/*
 send a true value to the form field which  display icon button to update card
  @param ID, Title, Description
*/
export const updateForm = (newCard)=>{
  return {
  type: type.UPDATE_FORM,
  payload: newCard
  }
}

export const submitCard= (allcards, masterTitle)=>{
  let data = { cards :allcards, title: masterTitle };
 return async dispatch => {
    const res = await axios.post('/api/profile/MasterCard',data);
    dispatch( {type: type.SUBMIT_CARD, payload: res.data } );
  }
}

//  async (allcards, masterTitle)=>{
//   // have a post request which send
//   let data = { cards :allcards, title: masterTitle };
//   const res = await axios.post('/api/profile/MasterCard',data);
//   console.log(res);
//   return {
//   type: SUBMIT_CARD,
//   payload: res
//   }
// }

//Test dispatch method from server
// export const testServer = () =>
//   async dispatch => {
//     const res = await axios.get('/api/profile/MasterCard');
//     dispatch( {type: TEST_CARD, payload: res.data } );
//
