export const ADD_CARD= "ADD_CARD",
 UPDATE_CARD= "UPDATE_CARD",
 DELETE_CARD="DELETE_CARD",
 UPDATE_FORM="UPDATE_FORM",
 TEST_CARD = "TEST_CARD";

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

/* For onEnter method */
// const dummy = [ {id:"kiss", title:"Toni", date:"november 2,2017"},
//                 {id:"love", title:"Parent", date:"september 4, 2013"},
//                 {id:"No", title:"Conflict", date:"september 16, 2018"},
//                 {id:"Dreams", title:"Realize", date:"March 14, 2018"}
//             ];
// export function testCard(card){
//   return {
//     type: TEST_CARD,
//     payload:  dummy
//   };
// }
