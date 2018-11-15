import React from  'react';
export  const CbPublic  = (props)=>{
  // When they check this box their cards are to be shown public
  // so i can have an action creater that get the users subcards and master cards and then send
  // it to a public access pool which puts there name on the card as well
  return (
    <input type="checkbox" id="create" className="master__checkbox"/>
  );
};
