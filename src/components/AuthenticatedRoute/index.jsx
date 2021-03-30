import React from 'react';
import { Route } from 'react-router-dom';
import { isAuthenticated, authenticate, getRoles, getUserId } from 'util/api';

// TODO: make distinction between google auth and github auth clearer

// checks if the user's token matches the desired provider
// (also passes if REACT_APP_TOKEN is set because that indicates local development,
// so there's only one token and we don't get to choose which provider we want)
const isDesiredAuthentication = (provider) =>  getUserId().startsWith(provider) || !!process.env.REACT_APP_TOKEN;

const AuthenticatedRoute = ({ path, provider = 'google', ...props }) => {
  // make sure user is authenticated, and that their authentication provider matches the desired one
  if (!isAuthenticated() || !isDesiredAuthentication(provider)) {
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
