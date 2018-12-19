import React from  'react';
import close from  '../../img/SVG/close-outline.svg';
import update from  '../../img/SVG/compose.svg';
export const Card  = (props)=>{
  const {title, description} = props;

    return (
      <div className="container-card">
        <div className="card">
          <div className="card__side  card__side--front">
            <div className="card__title card__title--center">{title}</div>
          </div>
          <div className="card__side card__side--back">
            <div className=" card__svg u-br-bt">
              <img onClick={()=> console.log("put an input field infront of the form")}  src={update} alt='U'/>
              <img onClick={()=> console.log("remove this card from the database and from the filter")}  src={close} alt='X'/>
            </div>
            <div className="card__description">
              {description}
            </div>
          </div>
        </div>
      </div>
    );
  }
