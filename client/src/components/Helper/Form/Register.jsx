  import React, {PureComponent } from 'react'
  import {RegisterUser} from '../../../actions'
    import { connect } from 'react-redux';
  class Register extends PureComponent{

    constructor(props){
      super(props);
      this.state = {username : "", password : ""};
    }
  UpdateUserName = (e) =>{this.setState({username: e.target.value}); }
  Updatepwd = (e) =>{this.setState({password: e.target.value});}


  onSubmit = (e) =>{
    e.preventDefault();
    const {username ,password} =  this.state;
    if(username !== "" && password !== ""){
      const data =  {username, password};
      this.props.closeForm();
      this.props.RegisterUser(data);
    }else{
      console.log("A field has not been inputed");
    }

  }
  onClose = (e) => {
    e.preventDefault();
    this.props.closeForm();
  }
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

              <div className="form__group--btn">
                <button className="form__btn form__btn--submit"  onClick = {this.onSubmit}>Submit</button>
                <button className="form__btn form__btn--close" onClick= {this.onClose} >Close</button>
              </div>
            </form>
        </div>
      );
    }

  }

  export default connect(null, {RegisterUser})(Register);
