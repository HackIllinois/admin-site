import {
  GET_REGISTRATION_REQUEST,
  GET_REGISTRATION_SUCCESS,
  GET_REGISTRATION_FAILURE,
  GET_REGISTRATION_LIST_REQUEST,
  GET_REGISTRATION_LIST_SUCCESS,
  GET_REGISTRATION_LIST_FAILURE,
} from './actions';

const initialState = {
  fetching: false,
  error: false,
  attendee: null,
  usersList: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_REGISTRATION_REQUEST:
      return Object.assign({}, state, { fetching: true, error: false, attendee: null });
    case GET_REGISTRATION_SUCCESS:
      return Object.assign({}, state, { fetching: false, error: false, attendee: action.attendee.attendee});
    case GET_REGISTRATION_FAILURE:
      return Object.assign({}, state, { fetching: false, error: true, attendee: null });
    case GET_REGISTRATION_LIST_REQUEST:
      return Object.assign({}, state, { fetching: true, error: false, usersList: [] });
    case GET_REGISTRATION_LIST_SUCCESS:
      return Object.assign({}, state, { fetching: false, error: false, usersList: action.usersList });
    case GET_REGISTRATION_LIST_FAILURE:
      return Object.assign({}, state, { fetching: false, error: true, usersList: [] });
    default:
      return state;
  }
};

export default reducer;
