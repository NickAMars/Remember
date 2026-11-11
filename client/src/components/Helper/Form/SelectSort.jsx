import React from  'react';
// import { Link } from 'react-router-dom';

// functional component that display one card item
export  const SelectSort = (props)=>{
  const {selectSort} = props;
  // onClick={()=>onClick(referenceID)}
// let date  = new Date(timestamp.toString());
  return (

    <div className="search__filter">
       <button className="search__btn">Filter </button>
       <ul className="filter__list">
         <li className="filter__list-item"><button onClick={selectSort} className="filter__list-link" >a - z</button></li>
         <li className="filter__list-item"><button onClick={selectSort} className="filter__list-link" >z - a</button></li>
         <li className="filter__list-item"><button onClick={selectSort} className="filter__list-link">New Cards</button></li>
         <li className="filter__list-item"><button onClick={selectSort} className="filter__list-link">Old Cards</button></li>
       </ul>
    </div>
  );
};

// <select className="filter__list" onChange={selectSort}>
//   <option className="filter__list-item" value="a-z">A - Z</option>
//   <option className="filter__list-item" value="z-a">z - a</option>
//   <option className="filter__list-item" value="newcards">New Cards</option>
//   <option className="filter__list-item" value="oldcards">Old Cards</option>
// </select>
