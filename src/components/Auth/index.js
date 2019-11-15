import React from 'react';

import { getToken } from 'api';

export default class Auth extends React.Component {
  componentDidMount() {
    const { location } = this.props;

    const searchParams = new URLSearchParams(location.search);

    const code = searchParams.get('code');
    const to = searchParams.get('to');

    if (code) {
      getToken(code).then(token => {
        sessionStorage.setItem('token', token.token);
        window.location.replace(to);
      });
    }
  }

  render() {
    return (
      <div>Loading...</div>
    )
  }
}