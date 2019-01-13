import { fetchDecision } from 'services/api/decision';

export const GET_DECISION_REQUEST = 'GET_DECISION_REQUEST';
export const GET_DECISION_SUCCESS = 'GET_DECISION_SUCCESS';
export const GET_DECISION_FAILURE = 'GET_DECISION_FAILURE';

export function requestDecision(query) {
  return {
    type: GET_DECISION_REQUEST,
    query,
  }
}

export function receiveDecision(err, data) {
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

export function getDecision(query, token) {
  return (dispatch) => {
    dispatch(requestDecision(query));
    fetchDecision(query, token)
      .then(data => dispatch(receiveDecision(false, data)))
      .catch(err => dispatch(receiveDecision(true, null)));
  };
}
