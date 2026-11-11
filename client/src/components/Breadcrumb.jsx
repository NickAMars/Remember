import React from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from '../utils/withRouter';

const routeNames = {
  '/home': 'Home',
  '/study': 'Study',
  '/browse': 'Browse',
};

const Breadcrumb = ({ location, match }) => {
  const path = location.pathname;
  const crumbs = [{ label: 'Home', to: '/home' }];

  if (path === '/study') {
    crumbs.push({ label: 'Study', to: null });
  } else if (path === '/browse') {
    crumbs.push({ label: 'Browse', to: null });
  } else if (path === '/folders' || path.startsWith('/folders/')) {
    crumbs.push({ label: 'Folders', to: path === '/folders' ? null : '/folders' });
    if (path.startsWith('/folders/')) {
      crumbs.push({ label: 'Folder', to: null });
    }
  } else if (path.startsWith('/quiz')) {
    crumbs.push({ label: 'Folders', to: '/folders' });
    crumbs.push({ label: 'Quiz', to: null });
  } else if (path.startsWith('/smallcards/')) {
    const from = location.state && location.state.prevent ? '/browse' : '/study';
    crumbs.push({ label: from === '/browse' ? 'Browse' : 'Study', to: from });
    crumbs.push({ label: 'Cards', to: null });
  } else if (path.startsWith('/home/subcards/')) {
    crumbs.push({ label: 'Study', to: '/study' });
    const title = match.params.title || 'New Deck';
    crumbs.push({ label: title, to: null });
  }

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
