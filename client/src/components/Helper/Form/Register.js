  import React, {PureComponent } from 'react'
  // import { Link } from 'react-router-dom'
  class Register extends PureComponent{

    constructor(props){
      super(props);
      this.state = {userName : "", pwd : "", pwdCheck: ""};
    }
  UpdateUserName = (e) =>{this.setState({userName: e.target.value}); }
  Updatepwd = (e) =>{this.setState({pwd: e.target.value});}
  UpdatepwdCheck = (e) =>{this.setState({pwdCheck: e.target.value});}
  validateUsername = (username) =>{}
  validatePassword = (password,passwordCheck) =>{}
  onSubmit = (e) =>{
    e.preventDefault();
    console.log( "User name :" ,this.state)
    
  }
    render(){
      return(
          <form className="" onSubmit={this.onSubmit}>
            <div className="">
              <input id="name" className="" type="text"  value={this.state.userName}  onChange={this.UpdateUserName}  maxLength="32" />
              <label htmlFor="name"> userName</label>
            </div>
            <div className="">
              <input id="psw" className="" type="password" value={this.state.pwd} onChange={this.Updatepwd} />
              <label htmlFor="psw"> Password</label>
            </div>
            <div className="">
              <input id="checkpsw" className="" type="password" value={this.state.pwdCheck} onChange={this.UpdatepwdCheck} />
              <label htmlFor="checkpsw"> Check Password</label>
            </div>
            <div className="">
              <button className="" > Submit </button>
            </div>
          </form>
      );
    }

  }

              // <Link className="" to="/">Submit</Link>
  export default Register;

  // this.userRef      = React.createRef();
  // this.passRef      = React.createRef();
  // this.passCheckRef = React.createRef();
