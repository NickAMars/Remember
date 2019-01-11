import { combineReducers } from 'redux';
import user from './userProfile';
import  cards  from './cardOperations';
import  formupdate  from './updateForm';
import  master_card  from './master_card';
import showsubcards from './showsubcards';
const rootReducer = combineReducers({
  user,
  cards,
  formupdate,
  master_card, // to test server with actionCreater
  showsubcards
});

export default rootReducer;
