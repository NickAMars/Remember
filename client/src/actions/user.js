import axios from '../utils/api';
import { sha256, setToken, clearToken } from '../utils/auth';
import * as type from '../actions/types';


// get user id
// const user =
export  default  {
  fetchUser : () =>
    async dispatch => {
      try {
        const res = await axios.get('/api/profile');
        dispatch( {type: type.FETCH_USER, payload: res.data } );
      } catch (err) {
        clearToken();
        dispatch( {type: type.FETCH_USER, payload: null } );
      }
    },
    RegisterUser :(data) =>async dispatch => {
       try {
         const passwordDigest = await sha256(data.password);
         const res = await axios.post('/auth/signup', { username: data.username, passwordDigest });
         setToken(res.data.token);
         dispatch( {type: type.FETCH_USER, payload: res.data.user } );
       } catch (err) {
         console.error('Signup failed:', err.response ? err.response.data : err.message);
       }
     }
,
    loginUser : (data) =>
      async dispatch => {
        try {
          const passwordDigest = await sha256(data.password);
          const res = await axios.post('/auth/login', { username: data.username, passwordDigest });
          setToken(res.data.token);
          dispatch( {type: type.FETCH_USER, payload: res.data.user } );
        } catch (err) {
          console.error('Login failed:', err.response ? err.response.data : err.message);
        }
      }
}
