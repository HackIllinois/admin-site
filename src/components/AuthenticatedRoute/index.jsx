import React from 'react';
import { Route } from 'react-router-dom';
import { isAuthenticated, authenticate, getRoles, getUserId } from 'util/api';

const AuthenticatedRoute = ({ path, provider = 'google', ...props }) => {
  // make sure user is authenticated, and that their authentication provider matches the desired one
  if (!isAuthenticated() || (!getUserId().startsWith(provider))) {
    authenticate(path, provider);
    return <div>Loading</div>;
  }

  // indicates that the route is private (only for Staff and Admin)
  if (provider === 'google') {
    const roles = getRoles();
    if (roles.includes('Staff') || roles.includes('Admin')) {
      return <Route path={path} {...props}/>
    } else {
      window.location.replace('https://hackillinois.org/');
      return;
    }
  }

  // otherwise provider is github, indicating that the route is open to all
  return <Route path={path} {...props} />;
};

export default AuthenticatedRoute;
