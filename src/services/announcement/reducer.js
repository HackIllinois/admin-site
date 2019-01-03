import {
  SEND_ANNOUNCEMENT,
} from './actions';

const initialState = {
  announcement: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SEND_ANNOUNCEMENT:
      return Object.assign({}, state, { announcement: action.announcement});
    default:
      return state;
  }
};

export default reducer;
