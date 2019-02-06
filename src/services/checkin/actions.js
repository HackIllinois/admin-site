export const UPDATE_CHECKIN = 'UPDATE_CHECKIN';
export const updateCheckin = ( school, gender, gradYear ) => ({
  type: UPDATE_CHECKIN,
  school,
  gender,
  gradYear,
});
