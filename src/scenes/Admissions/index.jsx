import React from 'react';
import { connect } from 'react-redux';

import HackerSearch from '../../components/HackerSearch';
import { getDecisionList } from '../../services/decision/actions';
import { getRegistrationList } from '../../services/registration/actions';

import './styles.css';

class Admissions extends React.Component {
  componentDidMount() {
    this.getHackers("");
  }

  getHackers = (filter) => {
    const { getDecisionList, getRegistrationList, jwt } = this.props;
    if (jwt) {
      getRegistrationList(filter, jwt);
      getDecisionList(filter, jwt);
    }
  }

  render() {
    return (
      <div className="flexbox-center flexbox-columns" id="admissions">
        <HackerSearch filterListener={this.getHackers}/>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  jwt: state.auth.jwt,
});

const mapDispatchToProps = (dispatch) => ({
  getDecisionList: (query, token) => dispatch(getDecisionList(query, token)),
  getRegistrationList: (query, token) => dispatch(getRegistrationList(query, token)),
});

export default (connect(mapStateToProps, mapDispatchToProps)(Admissions));
