import React from 'react';
import { Link } from 'react-router-dom';

// camil case
// pass keys to this items when mapping over object
export const MasterCards = (props) =>{
  // update the date and the title with the props
  const {title, date,id} = props.card;

  // each more should have a dynamic router to the subcards associated with it
  return (
        <li className="master__items">
        {/*route needs an action creater which puts the values into the store for the Small cards component*/}
          <Link  to={`/smallcards/${id}`} className="master__links">
            <span className="master__title">{title}</span>
            <span className="master__date">{date}</span>
          </Link>
        </li>
  );
}
