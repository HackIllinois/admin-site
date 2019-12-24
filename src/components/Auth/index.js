import React from 'react';
import { getToken } from 'api';

export default class Auth extends React.Component {
  componentDidMount() {
    const { location } = this.props;

    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const to = params.get('to');

    if (code) {
      getToken(code).then(token => {
        sessionStorage.setItem('token', token);
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
