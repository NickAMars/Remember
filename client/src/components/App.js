import React, {PureComponent} from  'react';
import { BrowserRouter as Router, Route} from 'react-router-dom';
import MultipleCards from './MultipleCards';
import {Landing} from './Landing';
import Main from './Main';
import Mine from './Mine';
import SmallCards from './SmallCards';
import {Header} from './Header';
import { connect } from 'react-redux';
import { getMyCards, getPoolCards, fetchUser} from '../actions';
class App extends PureComponent{
  componentDidMount(){
    this.props.fetchUser();
  }


  render(){
    const {master} = this.props;
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
              if(master.length === 0)
                //"call this only once"
                this.props.getMyCards(location.pathname);


              return <Mine pathname={location.pathname} visible={true}/>;
              }
            } />

            <Route exact path='/main' component={Main} />
            <Route exact path='/' component={Landing} />

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
