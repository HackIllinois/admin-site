export const UPDATE_REGISTRATION = 'UPDATE_REGISTRATION';
export const updateRegistration = ( school, gender, gradYear ) => ({
  type: UPDATE_REGISTRATION,
  school,
  gender,
  gradYear,
});
