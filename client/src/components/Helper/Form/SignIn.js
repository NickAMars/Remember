import React, {Component} from 'react'
import { Link } from 'react-router-dom'
import google from  '../../../img/SVG/google-plus3.svg'
import facebook from  '../../../img/SVG/facebook2.svg'
import Modal from '../Modal'
import {Register} from '../Form'
/*
  import {Modal} from '../Modal';
  <div className="modal">
    <Modal>
      <h1>Register</h1>
      <input type="text" placeholder="userName" value=""/>
      <input type="password" placeholder="password" value=""/>
      <input type="password" placeholder="password" value=""/>
    </Modal>
  </div>
*/

export class SignIn extends Component{
  constructor(props){
    super(props);
    this.state = {
      userName: "Username",
      password: "password",
      isOpen: false
    };
  }
  toggleModal = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render(){
    // console.log("Modal : ",this.state.isModal);
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
             onChange={(event)=>{this.setState({userName: event.target.value })}}
              type="text" className="formA__input"
               value={this.state.userName} /* allows the input to depend on the state*/
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

            <Link className="btnA btnA--green " to="/main">Sign in &rarr;</Link>
            {/*<a className="btnA btnA--green " href="/auth/google"  to="/auth/login">Sign in &rarr;</a>*/}
          </div>
        </form>

            <button  className="" onClick={this.toggleModal}>Register &rarr;</button>
            <a href="/auth/google" className="btnA__svg"> <img src={google} alt='google'/> </a>
            <a href="/auth/facebook" className="btnA__svg"> <img src={facebook} alt='facebook'/> </a>
            <Modal show={this.state.isOpen}
                      onClose={this.toggleModal}>
                      <Register/>
            </Modal>

      </div>
    );
  }
}
// onClick={this.ToggleModel}/
// {this.state.isModal && <Modal > <Register  /> </Modal>}
