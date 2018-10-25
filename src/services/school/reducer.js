import {
  UPDATE_SCHOOL,
  ADD_SCHOOL,
} from './actions';

const defaultState = {
  school: []
};

const schoolReducer = (state = defaultState, action) => {
  switch (action.type) {
    case ADD_SCHOOL:
      return {
        ...state,
        school: [...state.school,
          {
            name: action.school.schoolName,
            numStudents: action.school.numStudents
          }
        ]}
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
