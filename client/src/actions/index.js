import smallcards from './smallcards';
import mastercards from './mastercards';
import poolcards from './poolcards';
import user from './user';




export const fetchUser = user.fetchUser;
export const RegisterUser = user.RegisterUser;
export const loginUser = user.loginUser;
export const getPoolCards = poolcards.getPoolCards;

// export const loginUser = user.loginUser;
// export const publicMaster = poolcards.publicMaster;

export const getMyCards = mastercards.getMyCards;
export const showMasterForm = mastercards.showMasterForm;
export const updateMaster = mastercards.updateMaster;
export const deleteMaster = mastercards.deleteMaster;


// All the Small Cards Opperations
export const addCard = smallcards.addCard;
export const deleteCard = smallcards.deleteCard;
export const updateCard = smallcards.updateCard;
export const updateForm = smallcards.updateForm;
// server side
export const submitCard = smallcards.submitCard;
