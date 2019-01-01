import React from  'react';

export  const CbPublic  = (props)=>{
  let checkbox = false;
  const publicCheckBox = () =>{
    if(!checkbox){
      // console.log(props.pubinfo);
      checkbox = true;
    }else{
      checkbox = false;
    }
  }
  return (
    <input  type="checkbox" id="create" onClick={publicCheckBox} className="master__checkbox"/>
  );
};
