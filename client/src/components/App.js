import React, {Component} from  'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import MultipleCards from './MultipleCards/MultipleCards';
import {Landing} from './Landing/Landing';
import {MasterCard} from './MasterCard/MasterCard';
// import SimpleMap from './SimpleMap';
import anchor from '../img/SVG/anchor.svg';
//TEST
const test = () =>{
  return (
    <div>
    <img src={anchor} height="40px" alt="first use of svg in react"/>
    </div>
  );
}
//mastercard goes to the beginning card
// mastercard/subcards - goes to the sub card field
class App extends Component{
  render(){
    return(
        <Router>
          <Switch>
            <Route path='/test' component={test} />
            <Route path='/mastercard/subcards' component={MultipleCards} />
            <Route path='/mastercard' component={MasterCard} />
            <Route path='/' component={Landing} />
          </Switch>
        </Router>
      )
    };
}
export default App;
    // <Route path='/map' component={SimpleMap} />
