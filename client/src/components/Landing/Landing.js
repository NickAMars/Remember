import React from 'react';
import { Link } from 'react-router-dom';
// import {Description} from './Description';
// import {SignIn} from './SignIn';
/*
Thinking that if i created the design before hand
 was a mistake.
 Rather create the design  while im working on the components
*/


export const Landing = () =>{

    return (
      <div>
        <header className="header">
          <div className="header-box">
            <span className="heading-primary">Future Memory</span>
          </div>
        </header>
        <Link to="/remember">Remember &rarr;</Link>
      </div>
    );
}
