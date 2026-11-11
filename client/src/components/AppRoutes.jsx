import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Mine from './Mine';
import Main from './Main';

// perf Increase: these routes used to fetch the deck list or public decks, and then Mine
// fetched the same data again on mount. Mine now does the only fetch.
export function BrowseRoute() {
  const location = useLocation();
  useEffect(() => { document.title = 'Browse - Remember'; }, []);
  return <Mine pathname={location.pathname} visible={false} />;
}

export function StudyRoute() {
  const location = useLocation();
  useEffect(() => { document.title = 'Study - Remember'; }, []);
  return <Mine pathname={location.pathname} visible={true} />;
}

export function HomeRoute() {
  useEffect(() => { document.title = 'Home - Remember'; }, []);
  return <Main />;
}
