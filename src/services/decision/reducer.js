import {
    GET_DECISION_REQUEST,
    GET_DECISION_SUCCESS,
    GET_DECISION_FAILURE,
  } from './actions';
  
const initialState = {
  fetching: false,
  error: false,
  decisions: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_DECISION_REQUEST:
      return Object.assign({}, state, { fetching: true, error: false, decisions: [] });
    case GET_DECISION_SUCCESS:
      return Object.assign({}, state, { fetching: false, error: false, decisions: action.decisions });
    case GET_DECISION_FAILURE:
      return Object.assign({}, state, { fetching: false, error: true, decisions: [] });
    default:
      return state;
  }
};
  
export default reducer;
  