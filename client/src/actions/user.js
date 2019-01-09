import axios from 'axios';
import * as type from '../actions/types';


// get user id
// const user =
export  default  {
  fetchUser : () =>
    async dispatch => {
      const res = await axios.get('/api/profile');
      dispatch( {type: type.FETCH_USER, payload: res.data } );
    },
    RegisterUser : async (data) =>{
      // async dispatch => {
      console.log('signup')
        const res = await axios.post('/auth/signup', data );
        console.log(res);
        // return dispatch( {type: type.FETCH_USER, payload: res.data } );

      // }
    },
    loginUser : async (data) =>{
      // async dispatch => {
      console.log("login");
        const res = await axios.post('/auth/login', data );
        console.log(res);
        // return dispatch( {type: type.FETCH_USER, payload: res.data } );

      // }
    }
}

// app.post('/auth/signup',authController.signup);

// export const serverTest = (newCard)=>{
//  return async dispatch => {
//     const res = await axios.get('/api/profile/MasterCard');
//     dispatch( {type: type.TEST_CARD, payload: res.data } );
//   }
// }
