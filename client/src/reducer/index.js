import { combineReducers } from 'redux';
import  cards  from './cardOperations';
import  formupdate  from './updateForm';
import  test  from './test_reducer';
const rootReducer = combineReducers({
  cards,
  formupdate,
  test // to test server with actionCreater
});

export default rootReducer;
