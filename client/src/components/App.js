import React, {Component} from  'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Remember from './Remember/Remember';
import {Landing} from './Landing/Landing';
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

class App extends Component{
  render(){
    return(
        <Router>
          <Switch>
            <Route path='/test' component={test} />
            <Route path='/remember' component={Remember} />
            <Route path='/' component={Landing} />
          </Switch>
        </Router>
      )
    };
}
export default App;
    // <Route path='/map' component={SimpleMap} />
/*
import PropTypes from 'prop-types';
class Welcome extends Component{
  render(){
  return <h1>Hello , {this.props.name}</h1>;
  }
}
Welcome.propTypes = {
name: PropTypes.string.isRequired
}
*/
