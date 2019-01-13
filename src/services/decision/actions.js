import { fetchDecisionList } from 'services/api/decision';

export const GET_DECISION_REQUEST = 'GET_DECISION_REQUEST';
export const GET_DECISION_SUCCESS = 'GET_DECISION_SUCCESS';
export const GET_DECISION_FAILURE = 'GET_DECISION_FAILURE';

export function requestDecisionList(query) {
  return {
    type: GET_DECISION_REQUEST,
    query,
  }
}

export function receiveDecisionList(err, data) {
  if (err) {
    return { type: GET_DECISION_FAILURE };
  }

  let decisionsArr = [];
  if (data.decisions) {
    decisionsArr = data.decisions;
  }

  return {
    type: GET_DECISION_SUCCESS,
    decisions: decisionsArr,
  };
}

export function getDecisionList(query, token) {
  return (dispatch) => {
    dispatch(requestDecisionList(query));
    fetchDecisionList(query, token)
      .then(data => dispatch(receiveDecisionList(false, data)))
      .catch(err => dispatch(receiveDecisionList(true, null)));
  };
}
