import React from 'react';
import { Link, withRouter } from 'react-router-dom';

const routeNames = {
  '/main': 'Home',
  '/mine': 'Study',
  '/more': 'Browse',
};

const Breadcrumb = ({ location, match }) => {
  const path = location.pathname;
  const crumbs = [{ label: 'Home', to: '/main' }];

  if (path === '/mine') {
    crumbs.push({ label: 'Study', to: null });
  } else if (path === '/more') {
    crumbs.push({ label: 'Browse', to: null });
  } else if (path.startsWith('/smallcards/')) {
    const from = location.query && location.query.prevent ? '/more' : '/mine';
    crumbs.push({ label: from === '/more' ? 'Browse' : 'Study', to: from });
    crumbs.push({ label: 'Cards', to: null });
  } else if (path.startsWith('/main/subcards/')) {
    crumbs.push({ label: 'Study', to: '/mine' });
    const title = match.params.title || 'New Deck';
    crumbs.push({ label: title, to: null });
  } else if (path === '/main') {
    return null;
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav className="breadcrumb">
      {crumbs.map((crumb, i) => (
        <span key={i} className="breadcrumb__item">
          {i > 0 && <span className="breadcrumb__sep">/</span>}
          {crumb.to ? (
            <Link className="breadcrumb__link" to={crumb.to}>{crumb.label}</Link>
          ) : (
            <span className="breadcrumb__current">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default withRouter(Breadcrumb);
