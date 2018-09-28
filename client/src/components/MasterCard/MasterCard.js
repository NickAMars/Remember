import React, {Component} from 'react';
import {Header} from '../Header';
export class MasterCard extends Component{
  render(){
    return (
      <div>
      < Header />
       MasterCard
      </div>
    );
  }
}

/*
  What do i want this field to have?
  Step 1: Small card element with title size around 80-100px height and 300px width
  Step 2: Title center ()
  Step 3: want an image a uploaded image to be under the text.
  Step 4: I want a overlay over the image to make it not interfair with the text.
          probably dark with opacity:.3.

  There will be a small navigation layout where users can click between 'title', 'image'
  Title is not require if user uploads image.
  Image is not require if user uploads a title.

  Restriction- The title field should only be two row.


  General overview:
  Where is this card going to go in the end?
  Objectively its going to be stored with other mastercards in a section called Memory
  and also in a section which shows how long user spend on the card called Statics
*/
