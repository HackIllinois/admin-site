import React from 'react';
import { connect } from 'react-redux';

import HackerSearch from '../../components/HackerSearch';
import { getDecision } from '../../services/decision/actions';
import { getRegistration } from '../../services/registration/actions';

import './styles.css';

class Admissions extends React.Component {
  componentDidMount() {
    this.getHackers("");
  }

  getHackers = (filter) => {
    const { getDecision, getUserInfo, jwt } = this.props;
    if (jwt) {
      getDecision(filter, jwt);
      getUserInfo("localadmin", jwt);
    }
  }

  render() {
    return (
      <div className="flexbox-center flexbox-columns" id="admissions">
        <HackerSearch decisions={this.props.decisions} filterListener={this.getHackers}/>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  jwt: state.auth.jwt,
});

const mapDispatchToProps = (dispatch) => ({
  getDecision: (query, token) => dispatch(getDecision(query, token)),
  getUserInfo: (id, token) => dispatch(getRegistration(id, token)),
});

export default (connect(mapStateToProps, mapDispatchToProps)(Admissions));
