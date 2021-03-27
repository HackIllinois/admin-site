import React from 'react';
import { Route } from 'react-router-dom';
import { isAuthenticated, authenticate, getRoles } from 'util/api';

const AuthenticatedRoute = ({ path, isPrivate = false, ...props }) => {
  if (!isAuthenticated()) {
    authenticate(path, isPrivate ? 'google' : 'github');
    return <div>Loading</div>;
  }

  if (isPrivate) {
    const roles = getRoles();
    if (roles.includes('Staff') || roles.includes('Admin')) {
      return <Route path={path} {...props}/>
    } else {
      window.location.replace('https://hackillinois.org/');
      return;
    }
  }

  return <Route path={path} {...props} />;
};

export default AuthenticatedRoute;
