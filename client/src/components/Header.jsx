import React, {Component} from  'react';
import { Link } from 'react-router-dom';
import { withRouter } from '../utils/withRouter';
import { connect } from 'react-redux';
import { clearToken } from '../utils/auth';
import { LOGOUT } from '../actions/types';
import axios from '../utils/api';
import cog from  '../img/SVG/bookmarks.svg';
import { showToast } from '../utils/toast';

class Header extends Component{
  state = {
    buttonEvent: false,
    settingsOpen: false,
    confirmAction: null, // 'logout' or 'deactivate'
  }

  navClick = () => {
    this.setState(prev => {
      const next = !prev.buttonEvent;
      document.body.classList.toggle('nav-open', next);
      return { buttonEvent: next, settingsOpen: false };
    });
  }

  toggleSettings = (e) => {
    e.stopPropagation();
    this.setState(prev => ({ settingsOpen: !prev.settingsOpen }));
  }

  openConfirm = (action) => {
    this.setState({ confirmAction: action, settingsOpen: false });
  }

  closeConfirm = () => {
    this.setState({ confirmAction: null });
  }

  onLogout = () => {
    clearToken();
    this.props.dispatch({ type: LOGOUT });
    this.props.history.push('/');
  }

  onDeactivate = async () => {
    try {
      await axios.delete('/api/profile/deactivate');
      clearToken();
      this.props.dispatch({ type: LOGOUT });
      this.props.history.push('/');
    } catch (err) {
      showToast(err.response ? err.response.data.error : 'Deactivation failed');
    }
  }

  handleConfirm = () => {
    if (this.state.confirmAction === 'logout') {
      this.onLogout();
    } else if (this.state.confirmAction === 'deactivate') {
      this.onDeactivate();
    }
    this.closeConfirm();
  }

  render(){
    const { buttonEvent, settingsOpen, confirmAction } = this.state;

    const confirmMessages = {
      logout: { title: 'Logout', text: 'Are you sure you want to log out?', btn: 'Logout' },
      deactivate: { title: 'Deactivate Account', text: 'Are you sure you want to deactivate your account? All your data will be permanently deleted.', btn: 'Deactivate' },
    };
    const confirm = confirmAction ? confirmMessages[confirmAction] : null;

    return (
      <div style={{position: 'fixed', zIndex:10000}} >
        <button
          style={ { right: buttonEvent ? '20rem' : 0 } }
          onClick={this.navClick} className="navigation__button" >
          <img className="navigation__icon" src={cog} alt='X'/>
        </button>

        <nav
          style={ { width: buttonEvent ? '20rem' : 0 } }
          className="navbar" >
            {this.props.user && this.props.user.name && (
              <div className="navbar__user">
                <div className="navbar__user-avatar">{this.props.user.name.charAt(0).toUpperCase()}</div>
                <span className="navbar__user-name">{this.props.user.name}</span>
              </div>
            )}
            <ul className="navbar-nav">
              <li className="navbar-nav__items">
                <Link className="navbar-nav__link" to="/home">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <span>Home</span>
                </Link>
              </li>
              <li className="navbar-nav__items">
                <Link className="navbar-nav__link" to="/study">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                  </svg>
                  <span>Study</span>
                </Link>
              </li>
              <li className="navbar-nav__items">
                <Link className="navbar-nav__link" to="/folders">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                  </svg>
                  <span>Folders</span>
                </Link>
              </li>
              <li className="navbar-nav__items">
                <Link className="navbar-nav__link" to="/quiz">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>Quiz</span>
                </Link>
              </li>
              <li className="navbar-nav__items">
                <Link className="navbar-nav__link" to="/browse">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <span>Browse</span>
                </Link>
              </li>
            </ul>

            <div className="navbar__system">
              <button className="navbar__system-btn" onClick={this.toggleSettings}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                <span>System</span>
              </button>
              {settingsOpen && (
                <ul className="navbar__system-menu">
                  <li>
                    <button className="navbar__system-item" onClick={() => this.openConfirm('logout')}>Logout</button>
                  </li>
                  <li>
                    <button className="navbar__system-item navbar__system-item--danger" onClick={() => this.openConfirm('deactivate')}>Deactivate Account</button>
                  </li>
                </ul>
              )}
            </div>
        </nav>

        {confirm && <div className="dialog-overlay" onClick={this.closeConfirm}>
          <div className="dialog dialog--sm" onClick={(e) => e.stopPropagation()}>
            <div className="dialog__header">
              <h3 className="dialog__title">{confirm.title}</h3>
              <button className="dialog__close" onClick={this.closeConfirm}>&times;</button>
            </div>
            <div className="dialog__body">
              <p className="dialog__confirm-text">{confirm.text}</p>
              <div className="dialog__confirm-actions">
                <button className={`dialog__confirm-btn ${confirmAction === 'deactivate' ? 'dialog__confirm-btn--delete' : 'dialog__confirm-btn--primary'}`} onClick={this.handleConfirm}>{confirm.btn}</button>
                <button className="dialog__confirm-btn dialog__confirm-btn--cancel" onClick={this.closeConfirm}>Cancel</button>
              </div>
            </div>
          </div>
        </div>}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

export default withRouter(connect(mapStateToProps)(Header));
