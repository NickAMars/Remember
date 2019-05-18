import React from  'react';
// import { Link } from 'react-router-dom';

// functional component that display one card item
export  const TopFiveCard = (props)=>{
  const {referenceID ,title, timestamp } = props.cards;
  const {onClick} = props;
  // onClick={()=>onClick(referenceID)}
// let date  = new Date(timestamp.toString());
  return (
    <li className="list__items">
      <button onClick={()=>onClick(referenceID)} className="list__links">
        <span className="list__title ">{title}</span>
        <span className="list__date">{timestamp}</span>
      </button>
    </li>
  );
};
