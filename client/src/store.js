import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import reducers from './reducer';
import { LOGOUT } from './actions/types';
import { setUnauthorizedHandler } from './utils/api';

// redux-thunk lets action creators wait for API calls before they dispatch.
export const store = createStore(reducers, {}, applyMiddleware(thunk));

// An expired or invalid token signs the user out everywhere in the app.
setUnauthorizedHandler(() => {
  if (store.getState().user) store.dispatch({ type: LOGOUT });
});
