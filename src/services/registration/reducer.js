import {
  UPDATE,
} from './actions';

const initialState = {
  school: null,
  gender: null,
  gradYear: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE:
      return Object.assign({}, state, { school: action.school, gender: action.gender, gradYear: action.gradYear });
    default:
      return state;
  }
};

export default reducer;
