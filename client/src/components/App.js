import React, {Component} from  'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
//TEST
const test = () =>{
  return (
    <div className= "test">
      HELLO {' '}
      <button className= "test-scss">Testing route</button>
    </div>
  );
}


class App extends Component{

/* switch try to march the first one so do it from top to bottom*/
  render(){
    return(
        <Router>
          <Switch>
            <Route path='/' component={test} />
          </Switch>
        </Router>
      )
    };
}
export default App;
