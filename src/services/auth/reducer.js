import {
  SET_JWT,
} from './actions';

const initialState = {
  jwt: ''
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_JWT:
      return Object.assign({}, state, { jwt: action.jwt });
    default:
      return state;
  }
};

export default reducer;
