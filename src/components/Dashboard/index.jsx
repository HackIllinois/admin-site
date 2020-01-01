import React from 'react';
import { getStats } from 'api';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stats: {},
    };
  }

  componentDidMount() {
    getStats().then(stats => {
      this.setState({ stats });
    });
  }

  render() {
    const { stats } = this.state;

    return (
      <pre>{JSON.stringify(stats, null, 2)}</pre>
    )
  }
}
