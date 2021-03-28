import React from 'react';
import queryString from 'query-string';

import { getToken } from 'util/api';
import Loading from 'components/Loading';

export default class Auth extends React.Component {
  componentDidMount() {
    const { location } = this.props;
    const { code } = queryString.parse(location.search);

    // these are set in `authenticate` in util/api
    const { to, provider } = localStorage;

    if (code) {
      getToken(code, provider).then(token => {
        sessionStorage.setItem('token', token);

        localStorage.removeItem('to');
        localStorage.removeItem('provider');

        if (to) {
          window.location.replace(to);
        } else {
          window.location.replace(window.location.origin);
        }
      });
    }
  }

  render() {
    return (
      <Loading />
    )
  }
}
