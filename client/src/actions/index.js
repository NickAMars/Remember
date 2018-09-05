export const ADD_CARD= "ADD_CARD", UPDATE_CARD= "UPDATE_CARD", DELETE_CARD="DELETE_CARD";

export function addCard(card){
  return {
    type: ADD_CARD,
    payload: card
  };
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
