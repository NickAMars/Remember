import React from 'react';
import { Navigate } from 'react-router-dom';

/** Redirects to the landing page when no user is signed in. */
export function ProtectedRoute({ user, children }) {
  return user && user.uuid ? children : <Navigate to="/" />;
}
