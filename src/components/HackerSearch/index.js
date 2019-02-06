import React from 'react';
import { connect } from 'react-redux';

import HackerSearchInput from '../HackerSearchInput';
import HackerList from '../HackerList';

class HackerSearch extends React.Component {
  render() {
    return (
      <div className="app">
        <HackerSearchInput
          filterListener={this.props.filterListener}
        />
        <HackerList
          decisions={this.props.decisions}
          usersList={this.props.usersList}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  decisions: state.decision.decisions,
  usersList: state.registration.usersList,
});

export default connect(mapStateToProps)(HackerSearch);
