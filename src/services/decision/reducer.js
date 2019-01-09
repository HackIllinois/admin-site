import {
    GET_DECISION_REQUEST,
    GET_DECISION_SUCCESS,
    GET_DECISION_FAILURE,
  } from './actions';
  
const initialState = {
    fetching: false,
    error: false,
    decision: [],
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_DECISION_REQUEST:
            return Object.assign({}, state, { fetching: true, error: false, decision: [] });
        case GET_DECISION_SUCCESS:
            return Object.assign({}, state, { fetching: false, error: false, decision: action.decision });
        case GET_DECISION_FAILURE:
            return Object.assign({}, state, { fetching: false, error: true, decision: [] });
        default:
            return state;
    }
};
  
export default reducer;
