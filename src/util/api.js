const API = 'https://api.hackillinois.org';

function request(method, endpoint, body) {
  return fetch(API + endpoint, {
    method,
    headers: {
      Authorization: sessionStorage.getItem('token'),
      'Content-Type': 'application/json',
    },
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

export function authenticate(to, provider = 'google') {
  if (process.env.REACT_APP_TOKEN) {
    sessionStorage.setItem('token', process.env.REACT_APP_TOKEN);
  } else {
    localStorage.setItem('to', to);
    to = `${window.location.origin}/auth/`;
    to = `${API}/auth/${provider}/?redirect_uri=${to}`;
  }
  window.location.replace(to);
}

export function getToken(code) {
  const redirectUri = `${window.location.origin}/auth/`;
  return request('POST', `/auth/code/google/?redirect_uri=${redirectUri}`, { code })
    .then(res => res.token);
}

export function getRoles() {
  const token = sessionStorage.getItem('token');
  if (token) {
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    return tokenData.roles;
  }
  return [];
}

export function getDecisions() {
  return request('GET', '/decision/filter/')
    .then(res => res.decisions);
}

export function makeDecision(id, status, wave) {
  return request('POST', '/decision/', { id, status, wave });
}

export function finalizeDecision(id, finalized = true) {
  return request('POST', '/decision/finalize/', { id, finalized });
}

export function getEvents() {
  return request('GET', '/event/')
    .then(res => res.events);
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

export function getEventTracker(eventId) {
  return request('GET', `/event/track/event/${eventId}/`);
}

export function getNotificationTopics() {
  return request('GET', '/notifications/topic/')
    .then(res => res.topics);
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
    request('GET', `/notifications/topic/${topicId}/`)
      .then(res => res.notifications || [])
  );

  return Promise.all(promises).then(notificationsById =>
    notificationsById.reduce((allNotifications, notifications) => allNotifications.concat(notifications), [])
  );
}

export function sendNotification(notification, topic) {
  return request('POST', `/notifications/topic/${topic}/`, notification);
}

export function getRegistrations() {
  return request('GET', '/registration/attendee/filter/')
    .then(res => res.registrations);
}

export function getStats() {
  return request('GET', '/stat/');
}

export function getRsvps() {
  return request('GET', '/rsvp/filter/')
    .then(res => res.rsvps);
}

export function getCheckins() {
  return request('GET', '/checkin/list/')
    .then(res => res.checkedInUsers);
}