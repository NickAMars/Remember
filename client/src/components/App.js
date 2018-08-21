import React, {Component} from  'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Remember from './Remember';
//TEST
const test = () =>{
  return (
    <div>
    </div>
  );
}


class App extends Component{
  render(){
    return(
        <Router>
          <Switch>
            <Route path='/test' component={test} />
            <Route path='/' component={Remember} />
          </Switch>
        </Router>
      )
    };
}
export default App;
