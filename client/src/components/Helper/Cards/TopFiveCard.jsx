import React from  'react';
import { Link } from 'react-router-dom';

export  const TopFiveCard = (props)=>{
  const {referenceID, title, maxTime } = props.cards;
  return (
    <li className="list__items">
      <Link to={`/smallcards/${referenceID}`} className="list__links" onClick={()=>props.onNavigate(referenceID)}>
        <span className="list__title">{title}</span>
        <span className="list__views">{maxTime}</span>
      </Link>
    </li>
  );
};
