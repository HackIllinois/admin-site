import { fetchUser } from 'services/api/user';

export const GET_USER_REQUEST = 'GET_USER_REQUEST';
export const GET_USER_FAILURE = 'GET_USER_FAILURE';
export const GET_USER_SUCCESS = 'GET_USER_SUCCESS';

function requestUser(id) {
  return {
    type: GET_USER_REQUEST,
    id,
  }
}

function receiveUser(err, user) {
  if (err)
    return { type: GET_USER_FAILURE };
  return {
    type: GET_USER_SUCCESS,
    user,
  };
}

export function getUser(id, token) {
  return (dispatch) => {
    dispatch(requestUser(id));
    fetchUser(id, token)
      .then(data => dispatch(receiveUser(false, data)))
      .catch(err => dispatch(receiveUser(true, null)));
  };
}
