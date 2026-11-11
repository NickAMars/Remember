import React, { PureComponent, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { connect } from 'react-redux';
import Header from './Header';
import Breadcrumb from './Breadcrumb';
import { fetchUser } from '../actions';
import { RootRoute } from './RootRoute';

// perf Increase: each page is its own download, loaded the first time it is opened, so the
// landing page doesn't wait for the charts, quiz and folder code.
const MultipleCards = lazy(() => import('./MultipleCards'));
const SmallCards = lazy(() => import('./SmallCards'));
const Folders = lazy(() => import('./Folders'));
const FolderDetail = lazy(() => import('./Folders/FolderDetail'));
const Quiz = lazy(() => import('./Quiz'));
const BrowseRoute = lazy(() => import('./AppRoutes').then(routes => ({ default: routes.BrowseRoute })));
const StudyRoute = lazy(() => import('./AppRoutes').then(routes => ({ default: routes.StudyRoute })));
const HomeRoute = lazy(() => import('./AppRoutes').then(routes => ({ default: routes.HomeRoute })));

class App extends PureComponent{
  componentDidMount(){
    this.props.fetchUser();
  }

  render(){
    const { user } = this.props;

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

          <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
          <Routes>
            <Route path='/home/subcards/:title' element={<MultipleCards />} />
            <Route path='/smallcards/:idMaster' element={<SmallCards />} />
            <Route path='/folders' element={<Folders />} />
            <Route path='/folders/:folderUuid' element={<FolderDetail />} />
            <Route path='/quiz/:folderUuid' element={<Quiz />} />
            <Route path='/quiz' element={<Quiz />} />
            <Route path='/browse' element={<BrowseRoute />} />
            <Route path='/study' element={<StudyRoute />} />
            <Route path='/home' element={<HomeRoute />} />
            <Route path='/' element={<RootRoute user={user} />} />
          </Routes>
          </Suspense>

          </div>
        </Router>
      )
    };

}

export const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
}
export default connect(mapStateToProps, { fetchUser })(App);
