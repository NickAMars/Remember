import React, {Component} from  'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { clearToken } from '../utils/auth';
import { LOGOUT } from '../actions/types';
import cog from  '../img/SVG/bookmarks.svg';
class Header extends Component{
  state = {
    buttonEvent: false
  }

  navClick = async () => {
    await this.setState({buttonEvent: !this.state.buttonEvent})
  }

  onLogout = (e) => {
    e.preventDefault();
    clearToken();
    this.props.dispatch({ type: LOGOUT });
    this.props.history.push('/');
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
            {this.props.user && this.props.user.name && (
              <div className="navbar__user">
                <div className="navbar__user-avatar">{this.props.user.name.charAt(0).toUpperCase()}</div>
                <span className="navbar__user-name">{this.props.user.name}</span>
              </div>
            )}
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
                  <a className="navbar-nav-2__link" href="/" onClick={this.onLogout}>Logout</a>
                </li>
              </ul>
            </ul>
        </nav>
      </div>

    );
  }






}

const mapStateToProps = (state) => ({
  user: state.user,
});

export default withRouter(connect(mapStateToProps)(Header));
