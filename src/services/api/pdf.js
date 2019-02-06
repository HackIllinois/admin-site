const getPDFRoute = `${process.env.REACT_APP_API_ENDPOINT}/upload/resume`;

export function fetchPDF(id, token) {
  return fetch(`${getPDFRoute}/${id}/`, {
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
