export const UPDATE_UNIVERSITY = 'UPDATE_UNIVERSITY';
export const ADD_UNIVERSITY = 'ADD_UNIVERSITY';

export const updateUniversity = ( universityName, numStudents) => ({
  type: UPDATE_UNIVERSITY,
  universityName,
  numStudents,
});

