export const UPDATE_SCHOOL = 'UPDATE_SCHOOL';
export const ADD_SCHOOL = 'ADD_SCHOOL';

export const updateSchool = ( schoolName, numStudents) => ({
  type: UPDATE_SCHOOL,
  schoolName,
  numStudents,
});


export const addSchool = (schoolName, numStudents) => ({
  type: ADD_SCHOOL,
  schoolName,
  numStudents,
});

