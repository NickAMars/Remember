import React from  'react';
import PropTypes from 'prop-types';
/*
  @params key object
*/
// props.card is sent so i just take off a bit of it
export const Card = ({title, description}) => {
  return (
    <div className="container-card">
      <div className="card">
        <div className="card__side  card__side--front">
          <div className="card__title card__title--center">{title}</div>
        </div>
        <div className="card__side card__side--back">
          <div className="card__title card__title--border">{title}</div>
          <div className="card__description">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}

Card.propTypes ={
  title: PropTypes.string,
  description: PropTypes.string
}

  //{/* I want a image on the front part of this card to relate to the matterial in which they want to remember*/}
