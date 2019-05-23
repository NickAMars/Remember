import React, {Component} from  'react';
import { Link } from 'react-router-dom';
import cog from  '../img/SVG/bookmarks.svg';
export class Header extends Component{
  componentDidMount(){
    // the header is to call the server to recieve  the person id one time

    // store that id in the redux store. where i can get it at any time

    //but i also need to stop from call the server all the time
  }
  state = {
    buttonEvent: false
  }

  navClick = async () => {
    await this.setState({buttonEvent: !this.state.buttonEvent})
  }



  render(){
    return (
      <div style={{position: 'fixed', zIndex:10000}} >
        <button
        style={ { right: this.state.buttonEvent ? '20rem' : 0 } }
         onClick={this.navClick} className="navigation__button" >
        <img className="navigation__icon" src={cog} alt='X'/>
        </button>

        <nav
        style={ { width: this.state.buttonEvent ? '20rem' : 0 } }
        className="navbar" >
            <h1 className="navigation__header"> Select</h1>
            <ul className="navbar-nav">
              <li className="navbar-nav__items">
                <Link className="navbar-nav__link" to="/main">Main</Link>
              </li>
              <li className="navbar-nav__items">
                <Link className="navbar-nav__link" to="/mine">Mine</Link>
              </li>
              <li className="navbar-nav__items">
                <Link className="navbar-nav__link" to="/more">More</Link>
              </li>
              <ul className="navbar-nav-2">
                <li className="navbar-nav-2__items">
                  <Link className="navbar-nav-2__link" to="/">Setting</Link>
                </li>
                <li className="navbar-nav-2__items">
                  <a className="navbar-nav-2__link" href="/api/logout">Logout</a>
                </li>
                <li className="navbar-nav-2__items">
                  <a className="navbar-nav-2__link" href="/api/logout">Delete Account</a>
                </li>
              </ul>
            </ul>
        </nav>
      </div>

    );
  }






}
// <li className="nav-list__item"><Link to="/" className="nav-list__link">Profile</Link></li>



// render(){
//   return (
//     <nav className="nav u-mb-sm">
//       <ul className="nav-list">
//       { /*main links after user has sign in the can see these*/ }
//         <li className="nav-list__item"><Link to="/main" className="nav-list__link">Main</Link></li>
//         <li className="nav-list__item"><Link  to="/mine" className="nav-list__link" >Mine</Link></li>
//         <li className="nav-list__item"><Link  to="/more" className="nav-list__link" >More</Link></li>
//       </ul>
//       <div className="tool-bar">
//         <img className="tool-bar__item" src={cog} alt='X'/>
//         <ul className="nav-logout">
//         {/*ask the user if the want log out*/}
//           <li className="nav-logout__item"><a  href="/api/logout" className="nav-logout__link-log">LogOut</a></li>
//           <li className="nav-logout__item"><Link  to="/" className="nav-logout__link-log">Setting</Link></li>
//         </ul>
//       </div>
//     </nav>
//   );
// }
