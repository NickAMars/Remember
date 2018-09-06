export const ADD_CARD= "ADD_CARD",
 UPDATE_CARD= "UPDATE_CARD",
 DELETE_CARD="DELETE_CARD",
 UPDATE_FORM="UPDATE_FORM";

export function addCard(card){
  // this process is never to go to the back end
  // i will use a cookie to store the cards so that when
  // the user refresh the screen all the cards arnt lost
  // will apply in the memory section
  return {
    type: ADD_CARD,
    payload: card
  };
}
export function deleteCard(id){
  return {
  type: DELETE_CARD,
  payload: id
  }
}
/*
  @param ID, Title, Description
*/
export function updateCard(newCard){
  return {
  type: UPDATE_CARD,
  payload: newCard
  }
}

/*
 send a true value to the form field which  display icon button to update card
  @param ID, Title, Description
*/
export function updateForm(newCard){
  return {
  type: UPDATE_FORM,
  payload: newCard
  }
}
