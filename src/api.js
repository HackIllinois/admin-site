const API = 'https://api.hackillinois.org';

function headers() {
  return {
    Authorization: sessionStorage.getItem('token'),
    'Content-Type': 'application/json',
  };
}

function request(method, endpoint, body) {
  return fetch(API + endpoint, {
    method,
    headers: headers(),
    body: JSON.stringify(body),
  }).then(res => {
    if (res.ok) {
      return res.json();
    }
    throw Error(res);
  });
}

export function isAuthenticated() {
  return sessionStorage.getItem('token');
}

export function authenticate(to) {
  if (process.env.REACT_APP_TOKEN) {
    sessionStorage.setItem('token', process.env.REACT_APP_TOKEN);
  } else {
    to = `${process.env.REACT_APP_URL}/auth/?to=${to}`;
    to = `${API}/auth/github/?redirect_uri=${to}`;
  }
  window.location.replace(to);
}

export function getToken(code) {
  return request('POST', '/auth/code/github/', { code });
}

export function getRoles() {
  return request('GET', '/auth/roles/')
    .then(res => res.roles);
}

export function getEvents() {
  return request('GET', '/event/').then(res => res.events);
}

export function updateEvent(event) {
  return request('PUT', '/event/', event);
}

export function addEvent(event) {
  return request('POST', '/event/', event);
}

export function deleteEvent(eventId) {
  return request('DELETE', `/event/${eventId}/`);
}

export function getNotificationTopics() {
  return request('GET', '/notifications/topic/').then(res => res.topics);
}

export function addNotificationTopic(topic) {
  return request('POST', '/notifications/topic/', { id: topic });
}

export function removeNotificationTopic(topic) {
  return request('DELETE', `/notifications/topic/${topic}/`);
}

export function getNotifications(topicIds) {
  // using Promise.all to send web request for each topic so that they are sent simultaneously
  const promises = topicIds.map(topicId => 
    request('GET', `/notifications/topic/${topicId}/`).then(res => res.notifications || [])
  );

  return Promise.all(promises).then(notificationsById =>
    notificationsById.reduce((allNotifications, notifications) => allNotifications.concat(notifications), [])
  );
}

export function sendNotification(notification, topic) {
  return request('POST', `/notifications/topic/${topic}/`, notification);
}

export function getRegistrations() {
  return request('GET', '/registration/attendee/filter/').then(res => res.registrations);
}

export function getDecisions() {
  return request('GET', '/decision/filter/').then(res => res.decisions);
}

export function makeDecision(id, status, wave) {
  return request('POST', '/decision/', { id, status, wave });
}

export function finalizeDecision(id, finalized = true) {
  return request('POST', '/decision/finalize/', { id, finalized });
}
