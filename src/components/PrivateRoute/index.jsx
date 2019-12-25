import React from 'react';
import { Route } from 'react-router-dom';

import { isAuthenticated, authenticate } from 'api';

export default function PrivateRoute(props) {
  if (isAuthenticated()) {
    return <Route {...props}/>
  } else {
    authenticate(props.path);
    return <div>Redirecting...</div>
  }
}