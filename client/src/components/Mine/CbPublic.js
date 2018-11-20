import React from  'react';

export  const CbPublic  = (props)=>{
  let checkbox = false;
  const publicCheckBox = () =>{
    if(!checkbox){
      // call action creater sent from props here
      console.log(props.pubinfo);
      checkbox = true;
    }else{
      checkbox = false;
    }
  }
  return (
    <input type="checkbox" id="create" onClick={publicCheckBox} className="master__checkbox"/>
  );
};

// console.log(props.pubinfo);
// When they check this box their cards are to be shown public
// so i can have an action creater that get the users subcards and master cards and then send
// it to a public access pool which puts there name on the card as well


// const Mak
