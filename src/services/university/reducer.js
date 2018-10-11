import {
  UPDATE_UNIVERSITY,
  ADD_UNIVERSITY,
} from './actions';

const reducer = (state = [], action) => {
  switch (action.type) {
    case ADD_UNIVERSITY:
      return Object.assign({},
        ...state, {
          university: action.university,
          numStudents: action.numStudents
        });
    case UPDATE_UNIVERSITY:
      return state.map(university =>
        (university.id === action.id)
          ? {...university, numStudents: action.numStudents}
          : university
      )
    default:
      return state;
  }
};

export default reducer;
