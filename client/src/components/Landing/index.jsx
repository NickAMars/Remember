import React from 'react';
import {Description} from './Description';
// perf Increase: import SignIn directly. The Form index also pulls in the spreadsheet reader,
// which the landing page doesn't need.
import SignIn from '../Helper/Form/SignIn';


export const Landing = () =>{

    return (
      <div className="front-page">
        <header className="header">
          <div className="header-box">
            <span className="heading__primary heading__primary--white">Future Memory</span>
          </div>
        </header>
        <div className="font-container">
          <Description />
          <SignIn />
        </div>
      </div>
    );
}


// might put a forget password field in this application
