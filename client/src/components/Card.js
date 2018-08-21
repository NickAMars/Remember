import React from  'react';

/*
  @params key object
*/

export const Card = () => {

  return (
    <div className="container-card">
      <div className="card">
        <div className="card__side  card__side--front">
          <div className="card__title card__title--center">Title...</div>
        </div>
        <div className="card__side card__side--back">
          <div className="card__title card__title--border">Title...</div>
          <div className="card__description">
            Description...
          </div>
        </div>
      </div>
    </div>
  );
}

  //{/* I want a image on the front part of this card to relate to the matterial in which they want to remember*/}
