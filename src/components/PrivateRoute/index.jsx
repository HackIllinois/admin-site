import React from 'react';
import { Route } from 'react-router-dom';

import { isAuthenticated, authenticate, getRoles } from 'util/api';

export default function PrivateRoute(props) {
  if (!isAuthenticated()) {
    authenticate(props.path);
    return <div>Redirecting...</div>
  }

  const roles = getRoles();
  if (roles.includes('Staff') || roles.includes('Admin')) {
    return <Route {...props}/>
  } else {
    window.location.replace('https://hackillinois.org/');
  }
}