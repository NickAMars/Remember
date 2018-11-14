import React from  'react';



// functional component that display one card item
export  const Buttons  = (props)=>{
  const { display ,Add, Update, Submit } = props;

  return (
    <div>
    <button onClick={Update}  className={display?"btn btn__update btn__update-show":"btn btn__update btn__update-hide"}>U</button>
    <button onClick={Submit}  className="btn btn__submit">S</button>
    <button onClick={Add}  className="btn btn__add">+</button>
    </div>
  );
};
