import { combineReducers } from 'redux';
import { LOGOUT } from '../actions/types';
import user from './userProfile';
import  cards  from './cardOperations';
import  formupdate  from './updateForm';
import  master_card  from './master_card';
import showsubcards from './showsubcards';
import poolcards from './poolcards';

const appReducer = combineReducers({
  user,
  cards,
  formupdate,
  master_card,
  showsubcards,
  poolcards
});

const rootReducer = (state, action) => {
  if (action.type === LOGOUT) {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
