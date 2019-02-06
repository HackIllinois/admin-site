import React, { Component } from 'react';

import jwtDecode from 'jwt-decode';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';

import { getUser } from 'services/user/actions';

class Auth extends Component {
  componentDidMount() {
    const { getUser, user, jwt } = this.props;
    if (user.user === null && !user.fetching && !user.error && jwt) {
      getUser(jwtDecode(jwt).id, jwt);
    }
  }

  componentDidUpdate() {
    const { getUser, user, jwt } = this.props;
    if (user.user === null && !user.fetching && !user.error && jwt) {
      getUser(jwtDecode(jwt).id, jwt);
    }
  }

  render() {
    const { location, jwt } = this.props;
    if (location.pathname === "/login") {
      return null;
    }
    if (jwt === null) {
      return <Redirect to="/login" />;
    }
    return null;
  }
}

const mapStateToProps = (state) => ({
  jwt: state.auth.jwt,
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  getUser: (id, token) => { dispatch(getUser(id, token)); },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Auth));
