import React, {PureComponent} from  'react';
import { BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';
import MultipleCards from './MultipleCards';
import {Landing} from './Landing';
import Main from './Main';
import Mine from './Mine';
import SmallCards from './SmallCards';
import Header from './Header';
import Breadcrumb from './Breadcrumb';
// import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
// import axios from 'axios';
import { getMyCards, getPoolCards, fetchUser} from '../actions';
// this.axios = axios;
class App extends PureComponent{
  componentDidMount(){
    this.props.fetchUser();
  }

 // componentDidUpdate(prevProps, prevState, snapshot){
 //   console.log(prevProps)
 // }

  render(){
    const {master, user} = this.props;

    return(
      <Router >
        <div>
        {user && user.uuid && <div className="topbar">
          <span className="topbar__brand">Remember</span>
          <Breadcrumb />
        </div>}
        {user && user.uuid && <Header />}

          <Switch>
            <Route exact path='/home/subcards/:title' component={MultipleCards} />
            <Route exact path='/smallcards/:idMaster'  component={SmallCards} />
            <Route exact path='/browse' render={ ({location}) => {
              document.title = 'Browse - Remember';
              this.props.getPoolCards(location.pathname);
              return <Mine pathname={location.pathname}  visible={false}/>;
              }
            } />
            <Route exact path='/study'render={ ({location}) => {
              document.title = 'Study - Remember';
              if(!master.items || master.items.length === 0)
                this.props.getMyCards(location.pathname);

              return <Mine pathname={location.pathname} visible={true}/>;
              }
            } />
            <Route exact path='/home' render={() => {
              document.title = 'Home - Remember';
              return <Main />;
            }} />
            <Route exact path='/' render={() => {
              document.title = 'Remember';
              return user && user.uuid ? <Redirect to='/home' /> : <Landing />;
            }} />
          </Switch>

          </div>
        </Router>
      )
    };

}

export const mapStateToProps = (state) => {
  return {
    user: state.user,
    master: state.master_card
  };
}
export default connect(mapStateToProps,{getMyCards, getPoolCards, fetchUser})(App);
// import {Switch} from 'react-router-dom';
// <Switch> </Switch>
