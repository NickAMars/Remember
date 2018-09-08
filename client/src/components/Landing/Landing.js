import React from 'react';
import { Link } from 'react-router-dom';
// import {Description} from './Description';
// import {SignIn} from './SignIn';
/*
Main tags going to rap these and take up the remaining view port height of the front page
  Description going to be to the side take up 70% of the page
  SignIn going to have 30% of the page
  SignIn going to have google Icon button  and a facebook Icon button
  that you can use to sign in aswell.

*/


export const Landing = () =>{

    return (
      <div>
        <header className="header">
          <div className="header-box">
            <span className="heading-primary">Future Memory</span>
          </div>
        </header>
        <Link to="/mastercard/subcards">Remember &rarr;</Link>
      </div>
    );
}


// might put a forget password field in this application
