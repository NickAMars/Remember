// normal set up
import React from  'react';
import ReactDOM from 'react-dom';
import './style/css/main.css';
import App from './components/App';
// placing this at the top level to test route from my server side 
// import axios from 'axios';
import { Provider } from  'react-redux';
import {store} from  './store';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>
, document.getElementById('root'));
