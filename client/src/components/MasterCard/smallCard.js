import React from  'react';
import { Link } from 'react-router-dom';

// functional component that display one card item
export  const SmallCard  = (props)=>{
  return (
    <li className="list__items">
      <Link  to="/main" className="list__links">
        <span className="list__title">Master Card</span>
        <span className="list__date">time created</span>
      </Link>
    </li>
  );
};
