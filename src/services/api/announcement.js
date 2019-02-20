const getNotificationsRoute = `${process.env.REACT_APP_API_ENDPOINT}/notifications/`;

export function fetchNotificationTopics(token) {
  return fetch(`${getNotificationsRoute}`, {
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

export function pushAnnouncement(announcement, title, topic, token) {
  const body_object = {
    'topic' : topic,
    'body': announcement,
    'title' : title,
  };
  const body_JSON = JSON.stringify(body_object);
  return fetch(`${getNotificationsRoute}` + topic + '/', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: token,
    },
    body: body_JSON,
  }).then(response => {
    if (response.status >= 400) {
      throw new Error(response);
    }
    return response.json()
  });
}
