import React, {Component} from 'react';
import {Header} from '../Header';
import {SmallCard} from  './smallCard';
import {Graph} from  './graph';
// import TopFive from './TopFive';
export class MasterCard extends Component{
  // when the component has mounted then we are going to get the cards
  // from the database with the top amount result from yesterday
  componentDidMount(){
   // call action creater which places the result into the state
  }
  constructor(props){
    super(props);
    // wnat to hold 5 cards which are the best of the user
    this.state = {
      title: "Hello Job",
      cards: [
              {_id: "kiss", title:"title", date:"time create"},
              {_id: "heaven", title:"title", date:"time create"},
              {_id: "demons", title:"title", date:"time create"},
              {_id: "loveones", title:"title", date:"time create"},
              {_id: "pain", title:"title", date:"time create"}
            ]
    };
  }


  render(){
    return (
      <div>
        <div className="header-box">
          <h1 className="heading__primary heading__primary--pink u-mt-sm ">Remember</h1>
        </div>
        < Header />
        <div className="xcontainer-main u-mb-md">
            <div className="topcards">
              <h4 className="header__quaternary u-mb-sm">Top Five Cards </h4>
              <ul className="list">
                 {
                    this.state.cards.map( function(master, index){
                      // console.log(master);
                      return ( <SmallCard key={master._id}/>  );
                    })
                 }
               </ul>
            </div>

            <div className="topcards__graph">
              <Graph />
            </div>
        </div>
        <div className="create">
          <h4 className="heading__quaternary u-mb-md">Create Main Cards</h4>

          <input type="checkbox" id="create" className="checkbox"/>
          <label htmlFor="create" className="checkbox__label">
            <span className="checkbox__btn">&nbsp;</span>
          </label>


          <div className="create__contrainer ">
            <div className="create__cards  u-mb-sm">

              <div className="create__field">
                <input onChange={(event) => this.setState( {title:event.target.value} )} type="text" value={this.state.title} id="title" className="input__master-title" maxLength="35" />
              </div>
              <div className="create__view">
                <div className="card__view">
                  <div className="card__view-title">View Card Create</div>
                </div>
              </div>
            </div>
            <div className="create__cta u-mb-sm">
              <button className="create__cta-btn "> Create Master Card </button>
            </div>


          </div>
        </div>

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
