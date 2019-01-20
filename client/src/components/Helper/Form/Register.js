  import React, {PureComponent } from 'react'
  import {RegisterUser} from '../../../actions'
  import {validatePsw} from  '../Validate';
  class Register extends PureComponent{

    constructor(props){
      super(props);
      this.state = {username : "", password : "", pwdCheck: ""};
    }
  UpdateUserName = (e) =>{this.setState({username: e.target.value}); }
  Updatepwd = (e) =>{this.setState({password: e.target.value});}
  UpdatepwdCheck = (e) =>{this.setState({pwdCheck: e.target.value});}


  onSubmit = (e) =>{
    e.preventDefault();
    const {username ,password, pwdCheck} =  this.state;
    if(username !== "" && password !== "" && pwdCheck !== ""){
      // check if user name is already Their in server

      if(validatePsw(password,pwdCheck)){
        // send to server
        const data =  {username, password};
        // dont need to go to reducer
        this.props.closeForm();
        RegisterUser(data);
      }else{
        console.log(" invalid password ");
      }
    }else{
      console.log("A field has not been inputed");
    }

  }
  onClose = (e) => {
    e.preventDefault();
    this.props.closeForm();
  }
  // onSubmit={this.onSubmit}
    render(){
      return(
        <div className="modal__form">
            <form className="form">
            <div className="u-mb-sm ">
              <h2 className="heading__quaternary">Register</h2>
            </div>
              <div className="form__group">
                <input id="name" className="form__input" type="text"  value={this.state.username}  onChange={this.UpdateUserName}  maxLength="32" />
                <label className="form__label" htmlFor="name">UserName</label>
              </div>
              <div className="form__group">
                <input id="psw"  className="form__input" type="password" value={this.state.password} onChange={this.Updatepwd} />
                <label className="form__label" htmlFor="psw">Password</label>
              </div>
              <div className="form__group">
                <input id="checkpsw" className="form__input" type="password" value={this.state.pwdCheck} onChange={this.UpdatepwdCheck} />
                <label className="form__label" htmlFor="checkpsw">Password Check</label>
              </div>

              <div className="form__group--btn">
                <button className="form__btn form__btn--submit"  onClick = {this.onSubmit}>Submit</button>
                <button className="form__btn form__btn--close" onClick= {this.onClose} >Close</button>
              </div>
            </form>
        </div>
      );
    }

  }

              // <Link className="" to="/">Submit</Link>
  export default Register;

  // this.userRef      = React.createRef();
  // this.passRef      = React.createRef();
  // this.passCheckRef = React.createRef();
