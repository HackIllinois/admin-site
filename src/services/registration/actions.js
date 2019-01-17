import { fetchRegistration } from 'services/api/registration';

export const GET_REGISTRATION_REQUEST = 'GET_REGISTRATION_REQUEST';
export const GET_REGISTRATION_SUCCESS = 'GET_REGISTRATION_SUCCESS';
export const GET_REGISTRATION_FAILURE = 'GET_REGISTRATION_FAILURE';

export function requestRegistration(id) {
  return {
    type: GET_REGISTRATION_REQUEST,
    id,
  }
}

function receiveRegistration(err, registration) {
  if (err)
    return { type: GET_REGISTRATION_FAILURE };
  return {
    type: GET_REGISTRATION_SUCCESS,
    user: registration,
  };
}

export function getRegistration(id, token) {
  return (dispatch) => {
    dispatch(requestRegistration(id));
    fetchRegistration(id, token)
      .then(data => dispatch(receiveRegistration(false, data)))
      .catch(err => dispatch(receiveRegistration(true, null)));
  };
}
