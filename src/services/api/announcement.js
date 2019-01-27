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

export function pushAnnouncement(announcement, topic, token) {
  return fetch(`${getNotificationsRoute}/` + topic, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: token,
    },
    body: {
      'topic' : topic,
      'body': announcement,
    },
  }).then(response => {
    if (response.status >= 400) {
      throw new Error(response);
    }
    return response.json()
  });
}
