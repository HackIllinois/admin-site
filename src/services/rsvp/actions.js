export const UPDATE_RSVP = 'UPDATE_RSVP';
export const updateRsvp = ( school, gender, gradYear ) => ({
  type: UPDATE_RSVP,
  school,
  gender,
  gradYear,
});
