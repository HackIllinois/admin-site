import React from 'react';
import { connect } from 'react-redux';

import HackerSearch from '../../components/HackerSearch';
import { getDecisionList } from '../../services/decision/actions';
import { getRegistrationList } from '../../services/registration/actions';

import './styles.css';

class Admissions extends React.Component {
  componentDidMount() {
    this.getHackers("", 0);
  }

  getHackers = (github, wave) => {
    const { getDecisionList, getRegistrationList, jwt } = this.props;
    
    if (jwt) {
      let registrationQuery = "";
      if (github.length > 0) {
        registrationQuery = "id=" + github;
      }

      let decisionQuery = registrationQuery;
      // TODO: check what the starting wave number is
      if (wave > 0) {
        decisionQuery += "&wave=" + wave.toString();
      }

      getRegistrationList(registrationQuery, jwt);
      getDecisionList(decisionQuery, jwt);  
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
