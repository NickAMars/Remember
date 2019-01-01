import React from  'react'
// import { connect } from 'react-redux';
import close from  '../../img/SVG/close-outline.svg'
import update from  '../../img/SVG/compose.svg'


export const Card  = (props)=>{
  const {id, title,description} = props;

    return (
      <div className="container-card">
        <div className="card">
          <div className="card__side  card__side--front">
            <div className="card__title card__title--center">{title}</div>
            {/*Want the time when the card is created*/}
          </div>
          <div className="card__side card__side--back">
             <div className=" card__svg u-br-bt">
             {/*for these to happen the card must have an id value which we can pass into the function onclick*/}
             <img onClick={()=>props.updateForm({display:true ,id, title, description })}  src={update} alt='U'/>          {/*update*/}
            <img onClick={()=>props.deleteCard(id)}  src={close} alt='X'/>        {/*delete*/}
            </div>
            <div className="card__description">
              {description}
            </div>
          </div>
        </div>
      </div>
    );
  }







// export default connect(null, {deleteCard})(Card);

//note:later
  //{/* I want a image on the front part of this card to relate to the matterial in which they want to remember*/}
