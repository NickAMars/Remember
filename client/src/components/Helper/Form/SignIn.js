import React, {Component} from 'react'
// import { Link } from 'react-router-dom'
  import {loginUser} from '../../../actions'
// import google from  '../../../img/SVG/google-plus3.svg'
// import facebook from  '../../../img/SVG/facebook2.svg'
import Modal from '../Modal'
import {Register} from '../Form'


export class SignIn extends Component{
  constructor(props){
    super(props);
    this.state = {
      username: "username",
      password: "password",
      isOpen: false
    };
  }
  toggleModal = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  onSubmit = (e) => {
    e.preventDefault();
  const {username, password}=this.state;
      loginUser({username, password});
  }

  render(){
    return (

      <div className="formA">
        <form>
          <div className=" u-mb-sm u-mt-md">
            <h2 className="heading__secondary">
              Sign In
            </h2>
          </div>

          <div className="formA__group">
            <input
             onChange={(event)=>{this.setState({username: event.target.value })}}
              type="text" className="formA__input"
               value={this.state.username} /* allows the input to depend on the state*/
               required/>

          </div>

          <div className="formA__group">
            <input
             onChange={(event)=>{this.setState({password: event.target.value })}}
              type="password"
              className="formA__input"
               value={this.state.password}  required/>
          </div>
          <div className="formA__group">
            <button className="btnA btnA--green " onClick={this.onSubmit}>Sign in &rarr;</button>
            {/*<a className="btnA btnA--green " href="/auth/google"  to="/auth/login">Sign in &rarr;</a>*/}
          </div>
        </form>

            <button  className="btn__register" onClick={this.toggleModal}>Register</button>
            <a href="/auth/google" className="btnA__svg">
              <svg  className="btnA__svg--google"   version="1.1" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 30 30">
                <path d="M16 0c-8.838 0-16 7.162-16 16s7.162 16 16 16 16-7.163 16-16-7.163-16-16-16zM12 24c-4.425 0-8-3.575-8-8s3.575-8 8-8c2.162 0 3.969 0.787 5.363 2.094l-2.175 2.088c-0.594-0.569-1.631-1.231-3.188-1.231-2.731 0-4.963 2.263-4.963 5.050s2.231 5.050 4.963 5.050c3.169 0 4.356-2.275 4.538-3.45h-4.537v-2.744h7.556c0.069 0.4 0.125 0.8 0.125 1.325 0 4.575-3.063 7.819-7.681 7.819zM26 16v2h-2v-2h-2v-2h2v-2h2v2h2v2h-2z"></path>
              </svg>
            </a>
            <a href="/auth/facebook" className="btnA__svg">
              <svg  className="btnA__svg--facebook"  version="1.1" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 30 30">
                <path d="M29 0h-26c-1.65 0-3 1.35-3 3v26c0 1.65 1.35 3 3 3h13v-14h-4v-4h4v-2c0-3.306 2.694-6 6-6h4v4h-4c-1.1 0-2 0.9-2 2v2h6l-1 4h-5v14h9c1.65 0 3-1.35 3-3v-26c0-1.65-1.35-3-3-3z"></path>
              </svg>
            </a>
            <Modal show={this.state.isOpen}>
                      <Register closeForm={this.toggleModal}/>
            </Modal>

      </div>
    );
  }
// <img src={google} alt='google'/>
  // <img src={facebook} alt='facebook'/>

    // onClose={this.toggleModal}
}
// onClick={this.ToggleModel}/
// {this.state.isModal && <Modal > <Register  /> </Modal>}
