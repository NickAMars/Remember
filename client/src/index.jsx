// normal set up
import React from  'react';
import { createRoot } from 'react-dom/client';
import './style/css/main.css';
import App from './components/App';
// placing this at the top level to test route from my server side
import { Provider } from  'react-redux';
import {store} from  './store';

const root = createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
