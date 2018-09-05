// normal set up
import React from  'react';
import ReactDOM from 'react-dom';
import './style/css/main.css';
import App from './components/App';
// creating the redux store and listener
import reducer from './reducer';
import { createStore } from 'redux';
import { Provider } from  'react-redux';
const store = createStore(reducer);


/*
  Going to use redux-thunk for the middleware
   flag which waits for api request to finish
*/

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>
, document.getElementById('root'));
