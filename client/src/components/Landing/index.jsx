import React from 'react';
import { Link } from 'react-router-dom';
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
        <div className="browse-cta">
          <Link to="/browse" className="browse-cta__link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span>Browse public cards</span>
          </Link>
        </div>
      </div>
    );
}


// might put a forget password field in this application
