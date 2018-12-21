  import React, {PureComponent } from 'react';

  class Register extends PureComponent{
    constructor(props){
      super(props);
      this.userRef = React.createRef();
      this.passRef = React.createRef();
      this.passCheckRef = React.createRef();
      this.validatePassword  = this.validatePassword.bind(this);
      this.validateUsername  = this.validateUsername.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
    }
    validatePassword(password,passwordCheck){}
    validateUsername(username){}
    onSubmit(e){
      e.preventDefault();
    }

    render(){
      return(
        <div className="">
          <form className="">
                <input type="text"     ref= {this.userRef} placeholder="username" className="input__master-title" maxLength="32" />
                <input type="password" ref= {this.passRef}      className="input__master-title" maxLength="32" />
                <input type="password" ref= {this.passCheckRef} className="input__master-title" maxLength="32" />
          </form>
        </div>
      );
    }

  }

  export default Register;
