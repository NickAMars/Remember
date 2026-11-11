import axios from 'axios';
import { getToken, clearToken } from './auth';

let onUnauthorized = () => {};

/** Called once from main.jsx with the store, so a 401 also signs the user out of the app state. */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

axios.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Bug fix: the token was removed but the app still showed the signed-in pages.
      clearToken();
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

/** The server's error message, or a fallback when the request never reached it. */
export function errorMessage(error, fallback) {
  return (error && error.response && error.response.data && error.response.data.error) || fallback;
}

export default axios;
