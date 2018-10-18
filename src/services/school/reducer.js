import {
  UPDATE_SCHOOL,
  ADD_SCHOOL,
} from './actions';

const schoolReducer = (state = [], action) => {
  switch (action.type) {
    case ADD_SCHOOL:
      return Object.assign({},
        ...state, {
          school: action.schoolName,
          numStudents: action.numStudents,
          dogsColor: 'hsl(89, 70%, 50%)'
        });
    case UPDATE_SCHOOL:
      return state.map(school =>
        (school.schoolName === action.schoolName)
          ? {...school, numStudents: action.numStudents}
          : school
      );
    default:
      return state;
  }
};

export default schoolReducer;
