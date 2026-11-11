import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Mine from './Mine';
import Main from './Main';
import {Landing} from './Landing';

export function BrowseRoute({ getPoolCards }) {
  const location = useLocation();
  useEffect(() => {
    document.title = 'Browse - Remember';
    getPoolCards(location.pathname);
  }, []);
  return <Mine pathname={location.pathname} visible={false} />;
}

export function StudyRoute({ master, getMyCards }) {
  const location = useLocation();
  useEffect(() => {
    document.title = 'Study - Remember';
    if (!master.items || master.items.length === 0)
      getMyCards(location.pathname);
  }, []);
  return <Mine pathname={location.pathname} visible={true} />;
}

export function HomeRoute() {
  useEffect(() => { document.title = 'Home - Remember'; }, []);
  return <Main />;
}

export function RootRoute({ user }) {
  useEffect(() => { document.title = 'Remember'; }, []);
  return user && user.uuid ? <Navigate to='/home' /> : <Landing />;
}
