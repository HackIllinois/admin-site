import {
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  GET_USER_FAILURE,
} from './actions';

const initialState = {
  fetching: false,
  error: false,
  user: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_USER_REQUEST:
      return Object.assign({}, state, { fetching: true, error: false, user: null });
    case GET_USER_SUCCESS:
      return Object.assign({}, state, { fetching: false, error: false, user: action.user });
    case GET_USER_FAILURE:
      return Object.assign({}, state, { fetching: false, error: true, user: null });
    default:
      return state;
  }
};

export default reducer;
