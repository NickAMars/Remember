import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function GuestTopbar() {
  const { pathname } = useLocation();

  // Only show on pages accessible to guests (browse and public deck views).
  if (pathname !== '/browse' && !pathname.startsWith('/smallcards/')) return null;

  return (
    <div className="topbar topbar--guest">
      <Link to="/" className="topbar__brand">
        <svg className="topbar__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
        </svg>
        Remember
      </Link>
      <Link to="/" className="topbar__signin-link">Sign in</Link>
    </div>
  );
}
