import React from 'react';

import jwtDecode from 'jwt-decode';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';

import { getUser } from 'services/user/actions';

const Auth = (props) => {
  const { location, jwt, user } = props;
  if (location.pathname === "/login") {
    return null;
  }
  if (jwt === null) {
    return <Redirect to="/login" />;
  }
  if (user.user === null && !user.fetching && !user.error) {
    props.getUser(jwtDecode(jwt).id)
  }

  return null;
}

const mapStateToProps = (state) => ({
  jwt: state.auth.jwt,
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  getUser: (id) => { dispatch(getUser(id)); },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Auth));