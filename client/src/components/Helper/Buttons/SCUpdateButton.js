import React from  'react';
export  const SCUpdateButton  = ({ onClick ,display })=>{
  return (
    <button onClick={onClick}  className={display?"btn btn__update btn__update-show":"btn btn__update btn__update-hide"}>
      U
    </button>
  );
};
