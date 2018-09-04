import React, {Component} from  'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Remember from './Remember/Remember';
import {Landing} from './Landing/Landing';
import SimpleMap from './SimpleMap';
//TEST
const test = () =>{
  return (
    <div>
    </div>
  );
}

// 'AIzaSyCN1hQ8CDBkQvo7U_hAIf-5BV90hbxkzmg'
class App extends Component{
  render(){
    return(
        <Router>
          <Switch>
            <Route path='/test' component={test} />
            <Route path='/map' component={SimpleMap} />
            <Route path='/remember' component={Remember} />
            <Route path='/' component={Landing} />
          </Switch>
        </Router>
      )
    };
}
export default App;

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
