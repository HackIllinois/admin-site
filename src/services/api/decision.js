const getDecisionRoute = `${process.env.REACT_APP_API_ENDPOINT}/decision`;

export function fetchDecisionList(query, token) {
  return fetch(`${getDecisionRoute}/filter/?${query}`, {
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
