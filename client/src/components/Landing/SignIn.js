import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import google from  '../../img/SVG/google-plus3.svg';
import facebook from  '../../img/SVG/facebook2.svg';
export class SignIn extends Component{
  render(){
    return (
      <div className="formA">
          <div className=" u-mb-sm u-mt-md">
            <h2 className="heading__secondary">
              Sign In
            </h2>
          </div>

          <div className="formA__group">
            <input  type="text" className="formA__input" value="" required/>
          </div>

          <div className="formA__group">
            <input  type="password" className="formA__input" value="" required/>
          </div>
          <div className="formA__group">
            <Link className="btnA btnA--green " to="/mastercard/subcards">Sign in &rarr;</Link>
          </div>


          <Link to="/mastercard/subcards" className="btnA__svg"> <img src={google} alt='X'/> </Link>
          <Link to="/mastercard/subcards" className="btnA__svg"> <img src={facebook} alt='X'/> </Link>
      </div>
    );
  }
}
