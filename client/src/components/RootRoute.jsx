import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Landing } from './Landing';

/** "/" shows the landing page, or sends a signed-in user to Home. */
export function RootRoute({ user }) {
  useEffect(() => { document.title = 'Remember'; }, []);
  return user && user.uuid ? <Navigate to='/home' /> : <Landing />;
}
