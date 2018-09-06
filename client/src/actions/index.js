export const ADD_CARD= "ADD_CARD", UPDATE_CARD= "UPDATE_CARD", DELETE_CARD="DELETE_CARD";

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
  // This process is not to reach the back end
  // until user has fully submit
  // all there cards
  return {
  type: DELETE_CARD,
  payload: id
  }
}




/*
  function deleteCard
  @params ID
  function updateCard
  @param ID, Title, Description
  State being an array is a problem when i think about it


  Im going to temporary remove all my test casese
  The problem with testing and working on your application
   is that you need a complete build before testing
*/
