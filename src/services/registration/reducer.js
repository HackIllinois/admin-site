import {
  GET_PDF_REQUEST,
  GET_PDF_SUCCESS,
  GET_PDF_FAILURE,
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
  user: null,
  usersList: [],
  PDF: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_PDF_REQUEST:
      return Object.assign({}, state, { fetching: true, error: false });
    case GET_PDF_SUCCESS:
      return Object.assign({}, state, { fetching: false, error: false, PDF: action.PDF });
    case GET_PDF_FAILURE:
      return Object.assign({}, state, { fetching: false, error: true, PDF: null });
    case GET_REGISTRATION_REQUEST:
      return Object.assign({}, state, { fetching: true, error: false, user: null });
    case GET_REGISTRATION_SUCCESS:
      return Object.assign({}, state, { fetching: false, error: false, user: action.user });
    case GET_REGISTRATION_FAILURE:
      return Object.assign({}, state, { fetching: false, error: true, user: null });
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
