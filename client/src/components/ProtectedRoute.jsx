import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../utils/auth';

/**
 * Redirects to the landing page when no user is signed in.
 * Bug fix: while the profile is still loading (user is null and a token is saved) show a
 * loading state. Refreshing any page used to bounce the user to Home.
 */
export function ProtectedRoute({ user, children }) {
  if (user && user.uuid) return children;
  if (user === null && getToken()) return <div className="page-loading" aria-busy="true" />;
  return <Navigate to="/" />;
}
