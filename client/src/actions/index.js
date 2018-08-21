export const ADD_CARD= "ADD_CARD";

export function addCard(card){
  return {
    type: ADD_CARD,
    payload: card
  };
}
