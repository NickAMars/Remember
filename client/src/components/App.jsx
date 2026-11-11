import React, {PureComponent} from  'react';
import { BrowserRouter as Router, Route, Navigate, Routes} from 'react-router-dom';
import MultipleCards from './MultipleCards';
import {Landing} from './Landing';
import Main from './Main';
import Mine from './Mine';
import SmallCards from './SmallCards';
import Header from './Header';
import Folders from './Folders';
import FolderDetail from './Folders/FolderDetail';
import Quiz from './Quiz';
import Breadcrumb from './Breadcrumb';
import { connect } from 'react-redux';
import { getMyCards, getPoolCards, fetchUser} from '../actions';
import { BrowseRoute, StudyRoute, HomeRoute, RootRoute } from './AppRoutes';

class App extends PureComponent{
  componentDidMount(){
    this.props.fetchUser();
  }

  render(){
    const {master, user} = this.props;

    return(
      <Router >
        <div>
        {user && user.uuid && <div className="topbar">
          <span className="topbar__brand">
            <svg className="topbar__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
            </svg>
            Remember
          </span>
          <Breadcrumb />
        </div>}
        {user && user.uuid && <Header />}

          <Routes>
            <Route path='/home/subcards/:title' element={<MultipleCards />} />
            <Route path='/smallcards/:idMaster' element={<SmallCards />} />
            <Route path='/folders' element={<Folders />} />
            <Route path='/folders/:folderUuid' element={<FolderDetail />} />
            <Route path='/quiz/:folderUuid' element={<Quiz />} />
            <Route path='/quiz' element={<Quiz />} />
            <Route path='/browse' element={<BrowseRoute getPoolCards={this.props.getPoolCards} />} />
            <Route path='/study' element={<StudyRoute master={master} getMyCards={this.props.getMyCards} />} />
            <Route path='/home' element={<HomeRoute />} />
            <Route path='/' element={<RootRoute user={user} />} />
          </Routes>

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
