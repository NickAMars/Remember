import React from  'react';
import MasterCard from  '../Class/MasterCard';

export  const CbPublic  = (props)=>{
  let checkbox = false;
  const publicCheckBox = () =>{

    if(!checkbox){
      const {_id,title,user,subcards} = props.pubinfo;
      const Master = new MasterCard();
      Master.setID(_id).setAuthor(user).setTitle(title).setSubCards(subcards);
      props.addPoolCard(Master);
      checkbox = true;
    }else{
      checkbox = false;
    }
  }
  return (
    <input  type="checkbox" id="create" onClick={publicCheckBox} className="master__checkbox"/>
  );
};
