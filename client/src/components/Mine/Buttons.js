import React from  'react';


// functional component that display one card item
export  const Buttons  = (props)=>{
  let {delMaster,masterid} = props;
  return (
    <div className="master__svg ">

      <svg  version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 30 30">
          <path fill="#ffff00" d="M2 4v14h14v-6l2-2v10h-18v-18h10l-2 2h-6zM12.3 3.7l4 4-8.3 8.3h-4v-4l8.3-8.3zM13.7 2.3l2.3-2.3 4 4-2.3 2.3-4-4z"></path>
        </svg>

        <svg onClick={()=>delMaster(masterid)} version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 30 30">
          <path fill="#ff0000" d="M2.93 17.070c-1.884-1.821-3.053-4.37-3.053-7.193 0-5.523 4.477-10 10-10 2.823 0 5.372 1.169 7.19 3.050l0.003 0.003c1.737 1.796 2.807 4.247 2.807 6.947 0 5.523-4.477 10-10 10-2.7 0-5.151-1.070-6.95-2.81l0.003 0.003zM4.34 15.66c1.449 1.449 3.45 2.344 5.66 2.344 4.421 0 8.004-3.584 8.004-8.004 0-2.21-0.896-4.211-2.344-5.66v0c-1.449-1.449-3.45-2.344-5.66-2.344-4.421 0-8.004 3.584-8.004 8.004 0 2.21 0.896 4.211 2.344 5.66v0zM14.24 7.17l-2.83 2.83 2.83 2.83-1.41 1.41-2.83-2.83-2.83 2.83-1.41-1.41 2.83-2.83-2.83-2.83 1.41-1.41 2.83 2.83 2.83-2.83 1.41 1.41z"></path>
        </svg>
      </div>
  );
};
