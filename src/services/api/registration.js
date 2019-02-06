const getRegistrationRoute = `${process.env.REACT_APP_API_ENDPOINT}/registration`;

export function fetchRegistration(id, token) {
  return fetch(`${getRegistrationRoute}/${id}/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: token,
    },
  }).then(response => {
    if (response.status >= 400) {
      throw new Error(response);
    }
    return response.json()
  });
}

export function fetchRegistrationList(query, token) {
  return fetch(`${getRegistrationRoute}/filter/?${query}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: token,
    },
  }).then(response => {
    if (response.status >= 400) {
      throw new Error(response);
    }
    return response.json()
  });
}
