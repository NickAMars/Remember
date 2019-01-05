  import React, {PureComponent } from 'react'
  // import { Link } from 'react-router-dom'
  import {validatePsw} from  '../Validate';
  class Register extends PureComponent{

    constructor(props){
      super(props);
      this.state = {userName : "", pwd : "", pwdCheck: ""};
    }
  UpdateUserName = (e) =>{this.setState({userName: e.target.value}); }
  Updatepwd = (e) =>{this.setState({pwd: e.target.value});}
  UpdatepwdCheck = (e) =>{this.setState({pwdCheck: e.target.value});}


  onSubmit = (e) =>{
    e.preventDefault();
    const {userName ,pwd, pwdCheck} =  this.state;
    // console.log(this.state);
    if(userName !== "" && pwd !== "" && pwdCheck !== ""){
      // check if user name is already Their in server

      if(validatePsw(pwd,pwdCheck)){
        // send to server
        // console.log( pwd ,userName)
        console.log(" validation ");
      }else{
        console.log(" invalid password ");
      }
    }else{
      //
      console.log("A field has not been inputed");
    }

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
                <input id="name" className="form__input" type="text"  value={this.state.userName}  onChange={this.UpdateUserName}  maxLength="32" />
                <label className="form__label" htmlFor="name">UserName</label>
              </div>
              <div className="form__group">
                <input id="psw"  className="form__input" type="password" value={this.state.pwd} onChange={this.Updatepwd} />
                <label className="form__label" htmlFor="psw">Password</label>
              </div>
              <div className="form__group">
                <input id="checkpsw" className="form__input" type="password" value={this.state.pwdCheck} onChange={this.UpdatepwdCheck} />
                <label className="form__label" htmlFor="checkpsw">Password Check</label>
              </div>

              <div className="form__group--btn">
                <button className="form__btn form__btn--submit" onClick = {this.onSubmit}>Submit</button>
                <button className="form__btn form__btn--close" onClick= {this.props.onClose} >Close</button>
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
