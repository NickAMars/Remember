import axios from '../utils/api';
import { sha256, setToken, clearToken } from '../utils/auth';
import * as type from '../actions/types';
import { showToast } from '../utils/toast';


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
         const profile = await axios.get('/api/profile');
         dispatch( {type: type.FETCH_USER, payload: profile.data } );
         showToast('Account created successfully');
       } catch (err) {
         showToast(err.response ? err.response.data.error : 'Registration failed');
       }
     }
,
    loginUser : (data) =>
      async dispatch => {
        try {
          const passwordDigest = await sha256(data.password);
          const res = await axios.post('/auth/login', { username: data.username, passwordDigest });
          setToken(res.data.token);
          const profile = await axios.get('/api/profile');
          dispatch( {type: type.FETCH_USER, payload: profile.data } );
        } catch (err) {
          showToast(err.response ? err.response.data.error : 'Login failed');
        }
      }
}
