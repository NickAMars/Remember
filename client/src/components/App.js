import React, {Component} from  'react';
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import MultipleCards from './MultipleCards';
import {Landing} from './Landing';
import MasterCard from './MasterCard';
import Mine from './Mine';
import SmallCards from './SmallCards';
import {Header} from './Header';
import { connect } from 'react-redux';
import { getMyCards, getPoolCards, fetchUser} from '../actions';
class App extends Component{
  componentDidMount(){
    this.props.fetchUser();
    // console.log("this is the user",this.props.user);
  }


  render(){
    return(
        <Router >
        <div>
        {this.props.user && < Header />}
          <Switch>

            <Route path='/main/subcards/:title' component={MultipleCards} />
            <Route path='/smallcards/:idMaster'  component={SmallCards} />
            <Route path='/more' render={ ({location}) => {
              this.props.getMyCards(location.pathname);
              return <Mine  visible={false}/>;
              }
            } />
            <Route path='/mine'render={ ({location}) => {
              this.props.getPoolCards(location.pathname);
              return <Mine visible={true}/>;
              }
            } />

            <Route path='/main' component={MasterCard} />
            <Route path='/' component={Landing} />
          </Switch>
          </div>
        </Router>
      )
    };

}

export const mapStateToProps = (state) => {
  return {
    user: state.user
  };
}
export default connect(mapStateToProps,{getMyCards, getPoolCards, fetchUser})(App);
