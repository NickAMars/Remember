import { combineReducers } from 'redux';
import  cards  from './cardOperations';
import  formupdate  from './updateForm';

const rootReducer = combineReducers({
  cards,
  formupdate
});

export default rootReducer;
