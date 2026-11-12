import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { RegisterUser } from '../../../actions';
import { MIN_PASSWORD_LENGTH } from '../../../constance';
import { validateRegistration } from './registerValidation';

class Register extends PureComponent {
  state = { username: '', password: '', error: '' };

  updateUsername = (event) => { this.setState({ username: event.target.value, error: '' }); }
  updatePassword = (event) => { this.setState({ password: event.target.value, error: '' }); }

  onSubmit = (event) => {
    event.preventDefault();
    const { username, password } = this.state;
    // Security: a weak password was accepted before (even one character).
    const error = validateRegistration(username, password);
    if (error) {
      this.setState({ error });
      return;
    }
    this.props.closeForm();
    this.props.RegisterUser({ username: username.trim(), password });
  }

  onClose = (event) => {
    event.preventDefault();
    this.props.closeForm();
  }

  render() {
    return (
      <div className="modal__form">
        <form className="form">
          <div className="u-mb-sm ">
            <h2 className="heading__quaternary">Register</h2>
          </div>
          <div className="form__group">
            <input id="name" className="form__input" type="text" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck="false"
              value={this.state.username} onChange={this.updateUsername} maxLength="32" />
            <label className="form__label" htmlFor="name">UserName</label>
          </div>
          <div className="form__group">
            <input id="psw" className="form__input" type="password" autoComplete="new-password"
              value={this.state.password} onChange={this.updatePassword} minLength={MIN_PASSWORD_LENGTH} />
            <label className="form__label" htmlFor="psw">Password (at least {MIN_PASSWORD_LENGTH} characters)</label>
          </div>
          {this.state.error && <p className="form__error" role="alert" style={{ color: '#c0392b', fontSize: '1.2rem' }}>{this.state.error}</p>}

          <div className="form__group--btn">
            <button className="form__btn form__btn--submit" onClick={this.onSubmit}>Submit</button>
            <button className="form__btn form__btn--close" onClick={this.onClose}>Close</button>
          </div>
        </form>
      </div>
    );
  }
}

export default connect(null, { RegisterUser })(Register);
