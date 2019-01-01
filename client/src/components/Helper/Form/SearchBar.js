import React, {Component} from 'react';

export class SearchBar extends Component{
  constructor(props){
    super(props);
    this.state = {searchbar : "search me"};
  }
  render(){
    return(
      <div className="search">

        <div className="search__name">
          <input className="search__name--input" maxLength="32" type="text"/>
          <button className="search__icon-btn">
            <svg className="search__icon" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
              <path d="M31.008 27.231l-7.58-6.447c-0.784-0.705-1.622-1.029-2.299-0.998 1.789-2.096 2.87-4.815 2.87-7.787 0-6.627-5.373-12-12-12s-12 5.373-12 12 5.373 12 12 12c2.972 0 5.691-1.081 7.787-2.87-0.031 0.677 0.293 1.515 0.998 2.299l6.447 7.58c1.104 1.226 2.907 1.33 4.007 0.23s0.997-2.903-0.23-4.007zM12 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"></path>
            </svg>
          </button>
        </div>

        <div className="search__filter">
           <button className="search__btn">Filter </button>
           <ul className="filter__list">
             <li className="filter__list-item"><button className="filter__list-link" >a - z</button></li>
             <li className="filter__list-item"><button className="filter__list-link" >z - a</button></li>
             <li className="filter__list-item"><button className="filter__list-link"> newcards </button></li>
             <li className="filter__list-item"><button className="filter__list-link">oldcards</button></li>
           </ul>
        </div>

      </div>
    );
  }
}
