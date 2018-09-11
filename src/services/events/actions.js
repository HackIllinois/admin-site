export const UPDATE_EVENTS = 'UPDATE_EVENTS';
export const updateEvents = ( school, gender, gradYear ) => ({
  type: UPDATE_EVENTS,
  school,
  gender,
  gradYear,
});
