import React, {Component} from  'react';
import { Link } from 'react-router-dom';
import cog from  '../img/SVG/cog.svg';
export class Header extends Component{
  render(){
    return (
      <nav className="nav">
        <ul className="nav-list">
        {/*main links after user has sign in the can see these*/}
          <li className="nav-list__item"><Link to="/" className="nav-list__link">Profile</Link></li>
          <li className="nav-list__item"><Link to="/" className="nav-list__link">Master</Link></li>
          <li className="nav-list__item"><Link  to="/" className="nav-list__link" >Group</Link></li>
        </ul>
        <div className="tool-bar">
        <button class="tool-bar__item"> <img src={cog} alt='X'/> </button>
          <ul className="nav-logout">
          {/*ask the user if the want log out*/}
            <li className="nav-logout__item"><Link to="/" className="nav-logout__link-log">LogOut</Link></li>
            <li className="nav-logout__item"><Link  to="/" className="nav-logout__link-log">Setting</Link></li>
          </ul>
        </div>
      </nav>
    );
  }
}