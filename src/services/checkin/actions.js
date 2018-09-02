export const UPDATE = 'UPDATE';
export const update = ( school, gender, gradYear ) => ({
  type: UPDATE,
  school,
  gender,
  gradYear,
});
