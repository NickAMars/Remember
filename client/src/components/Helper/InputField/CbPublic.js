import React from  'react';
import MasterCard from  '../Class/MasterCard';

export  const CbPublic  = (props)=>{
  let checkbox = false;
  const publicCheckBox = () =>{

    if(!checkbox){
      const {uuid,title,user,subCards} = props.pubinfo;
      const Master = new MasterCard();
      Master.setID(uuid).setAuthor(user).setTitle(title).setSubCards(subCards);
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
