import React, {Component} from  'react';
import { BrowserRouter as Router, Route} from 'react-router-dom';
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


            <Route exact path='/main/subcards/:title' component={MultipleCards} />
            <Route exact path='/smallcards/:idMaster'  component={SmallCards} />
            <Route exact path='/more' render={ ({location}) => {
              this.props.getPoolCards(location.pathname);
              return <Mine pathname={location.pathname}  visible={false}/>;
              }
            } />
            <Route exact path='/mine'render={ ({location}) => {
              this.props.getMyCards(location.pathname);
              return <Mine pathname={location.pathname} visible={true}/>;
              }
            } />

            <Route exact path='/main' component={MasterCard} />
            <Route exact path='/' component={Landing} />

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
// import {Switch} from 'react-router-dom';
// <Switch> </Switch>
