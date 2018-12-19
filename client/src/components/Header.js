import React, {Component} from  'react';
import { Link } from 'react-router-dom';
import cog from  '../img/SVG/cog.svg';
export class Header extends Component{
  componentDidMount(){
    // the header is to call the server to recieve  the person id one time

    // store that id in the redux store. where i can get it at any time

    //but i also need to stop from call the server all the time
  }

  render(){
    return (
      <nav className="nav u-mb-sm">
        <ul className="nav-list">
        { /*main links after user has sign in the can see these*/ }
          <li className="nav-list__item"><Link to="/main" className="nav-list__link">Main</Link></li>
          <li className="nav-list__item"><Link  to="/mine" className="nav-list__link" >Mine</Link></li>
          <li className="nav-list__item"><Link  to="/more" className="nav-list__link" >More</Link></li>
        </ul>
        <div className="tool-bar">
          <img className="tool-bar__item" src={cog} alt='X'/>
          <ul className="nav-logout">
          {/*ask the user if the want log out*/}
            <li className="nav-logout__item"><a  href="/api/logout" className="nav-logout__link-log">LogOut</a></li>
            <li className="nav-logout__item"><Link  to="/" className="nav-logout__link-log">Setting</Link></li>
          </ul>
        </div>
      </nav>
    );
  }
}
// <li className="nav-list__item"><Link to="/" className="nav-list__link">Profile</Link></li>
