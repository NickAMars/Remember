// import React from 'react';
// import { Link } from 'react-router-dom';
//
// /*
//   only people who are allow to delete card from the public are the administrations
//   and the people who place the card in the public pool
//
//   import {Buttons} from './Buttons';
//   {route needs an action creater which puts the values into the store for the Small cards component}
//   // <Buttons />
// */
// // pass keys to this items when mapping over object
// export const MasterCards = (props) =>{
//   // update the date and the title with the props
//   const {title, date,id} = props.card;
//
//   // each more should have a dynamic router to the subcards associated with it
//   return (
//         <li className="master__items">
//           <Link  to={`/smallcards/${id}`} className="master__links">
//             <span className="master__title">{title}</span>
//             <span className="master__date">{date}</span>
//           </Link>
//         </li>
//   );
// }
//
// // TODO:  check if user id is the same as the feild on this master card. To provide delete button and update buttons
//        // as a direct access to the pool which would respond accordinly
