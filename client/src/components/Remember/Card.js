import React from  'react';
// import { connect } from 'react-redux';
import close from  '../../img/SVG/close-outline.svg';
import update from  '../../img/SVG/compose.svg';


/*
  @params key object
  All state need to have a unique id. for Update and delete.

  2 action creators
  switch functional component into a class

  Since update changes one componets title and description
  I would have to omit that object from the state, then insert a new object with the same id.
  in order to do that i would have to have another form input of title and description with a subit button.

*/
// props.card is sent so i just take off a bit of it
// export const Card = ({title, description}) => {
// export class Card extends Component{

  // updateCard= (props) =>{
  //   console.log(props);
  // }
  // removeCard = (id) => {
  //   // console.log(id);
  //   // this.props.deleteCard(id);
  // }
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
             <img onClick={()=>console.log('hello update')}  src={update} alt='U'/>          {/*update*/}
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
