import React from 'react';
import { getToken } from 'api';

export default class Auth extends React.Component {
  componentDidMount() {
    const { location } = this.props;

    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (code) {
      getToken(code).then(token => {
        sessionStorage.setItem('token', token);
        const to = localStorage.getItem('to');
        if (to) {
          localStorage.removeItem('to');
          window.location.replace(to);
        } else {
          window.location.replace(window.location.origin);
        }
      });
    }
  }

  render() {
    return (
      <div>Loading...</div>
    )
  }
}
