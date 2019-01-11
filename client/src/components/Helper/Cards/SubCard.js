import React from  'react';
// import close from  '../../img/SVG/close-outline.svg';
// import update from  '../../img/SVG/compose.svg';
import {UpdateButton, RemoveButton} from '../Buttons';
export const SubCard  = (props)=>{
  const {_id,title, descriptions} = props;

    return (
      <div className="container-card">
        <div className="card">
          <div className="card__side  card__side--front">
            <div className="card__title card__title--center">{title}</div>
          </div>
          <div className="card__side card__side--back">
            <div className=" card__svg u-br-bt">
              < UpdateButton onClick={updateCard} masterinfo={{_id, title}}/>
              < RemoveButton onClick={deleteCard} ID={_id} />
            </div>
            <div className="card__description">
              {descriptions}
            </div>
          </div>
        </div>
      </div>
    );
  }


  const deleteCard= () => {
    console.log("remove this card from the database and from the filter")
  }
  const updateCard = () => {
    console.log("put an input field infront of the form");
  }

  // <img onClick={()=> console.log("put an input field infront of the form")}  src={update} alt='U'/>
  // <img onClick={()=> console.log("remove this card from the database and from the filter")}  src={close} alt='X'/>
