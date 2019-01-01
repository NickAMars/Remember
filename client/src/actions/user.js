import axios from 'axios';
import * as type from '../actions/types';


// get user id
// const user =
export  default  {
  fetchUser : () =>
    async dispatch => {
      const res = await axios.get('/api/profile');
      dispatch( {type: type.FETCH_USER, payload: res.data } );
    }
}

// export const serverTest = (newCard)=>{
//  return async dispatch => {
//     const res = await axios.get('/api/profile/MasterCard');
//     dispatch( {type: type.TEST_CARD, payload: res.data } );
//   }
// }
