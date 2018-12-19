 import axios from 'axios';
import * as type from '../actions/types';






export const  fetchUser = () =>
  async dispatch => {
    const res = await axios.get('/api/profile');
    dispatch( {type: type.FETCH_USER, payload: res.data } );
  }

export const getMyCards = (pathname)=>{
 return async dispatch => {
    const res = await axios.get('/api/profile/MasterCard');
    dispatch( {type: type.MYCARDS, payload: res.data } );
  }
}

export const getPoolCards= (pathname)=>{
 return async dispatch => {
    // const res = await axios.get('/api/PoolCards');POOLCARDS
    const res= await "pool of cards that are public"
    dispatch( {type: type.POOLCARDS, payload: res.data } );
  }
}

export const showMasterForm = (flag,idMaster, title)=>{
  return {
  type: type.MASTER_FORM,
  payload: {visible: flag, id: idMaster, title}
  }
}



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
 export const deleteMaster = (id)=> async dispatch => {
     // console.log(id);
      await axios.delete( `/api/profile/MasterCard/${id}` );
     // Then we have to find the id of the card
     dispatch( {type: type.DELETE_MASTER, payload: id} );
}


 // put all master cards into a pool to be view by each user
 // havent created the pool yet in the server side
 export const publicMaster = (newCard)=>{
  return async dispatch => {
     const res = await axios.put('/api/profile/MasterCard', newCard);
     dispatch( {type: type.PUBLIC_MASTER, payload: res.data } );
   }
 }



// Initially making all the small cards
export const addCard = (card)=>{
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
export const updateCard = (newCard)=>{
  return {
  type: type.UPDATE_CARD,
  payload: newCard
  }
}

export const updateForm = (newCard)=>{
  return {
  type: type.UPDATE_FORM,
  payload: newCard
  }
}



export const submitCard =  (title, cards)=>{
  let data = { title , cards };
 return async dispatch => {
    const res = await axios.post('/api/profile/MasterCard',data);
    dispatch( {type: type.SUBMIT_CARD, payload: res.data } );
  }
}
