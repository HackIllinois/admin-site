import React from 'react';
import queryString from 'query-string';

import { getToken } from 'util/api';
import Loading from 'components/Loading';

export default class Auth extends React.Component {
  componentDidMount() {
    const { location } = this.props;
    const { code, to } = queryString.parse(location.search);

    if (code) {
      const provider = localStorage.getItem('provider'); // localStorage.provider is set in `authenticate` in util/api
      getToken(code, provider).then(token => {
        sessionStorage.setItem('token', token);
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
