import React from  'react';

/*
  @params key object
*/
// props.card is sent so i just take off a bit of it
export const Card = ({card}) => {
  return (
    <div className="container-card">
      <div className="card">
        <div className="card__side  card__side--front">
          <div className="card__title card__title--center">{card.title}</div>
        </div>
        <div className="card__side card__side--back">
          <div className="card__title card__title--border">{card.title}</div>
          <div className="card__description">
            {card.description}
          </div>
        </div>
      </div>
    </div>
  );
}

  //{/* I want a image on the front part of this card to relate to the matterial in which they want to remember*/}
