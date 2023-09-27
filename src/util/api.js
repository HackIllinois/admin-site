const API = 'https://adonix.hackillinois.org';

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
      // Temporary workaround to stop error from being thrown on delete event
      if (method === 'DELETE' && endpoint.startsWith('/event/')) {
        return res.text();
      } else {
        return res.json();
      }
    }
    throw res;
  });
}

export function isAuthenticated() {
  return sessionStorage.getItem('token');
}

export function authenticate(to, provider = 'google') {
  // if we're developing locally, REACT_APP_TOKEN should be set and we can skip the authentication workflow
  if (process.env.REACT_APP_TOKEN) {
    sessionStorage.setItem('token', process.env.REACT_APP_TOKEN);
    window.location.replace(to); // since there's no authentication necessary, we can go directly to `to`
  } else {
    // `to` is saved in localStorage so that it can be used in the Auth component later
    // (note: for github, we can add them to the redirect_uri as query parameters, but google doesn't support that it seems)
    localStorage.setItem('to', to);

    // const redirectURI = `${window.location.origin}/auth/`;
    const authURL = `${API}/auth/login/${provider}?device=admin`;
    window.location.replace(authURL);
  }
}

export function getTokenData() {
  const token = sessionStorage.getItem('token');
  if (token) {
    return JSON.parse(atob(token.split('.')[1]));
  }
  return null;
}

export function getRoles() {
  const tokenData = getTokenData();
  return tokenData ? tokenData.roles : [];
}

export function getUserId() {
  const tokenData = getTokenData();
  return tokenData ? tokenData.id : '';
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
  return request('GET', '/registration/attendee/list/')
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

export function getEventCode(eventId) {
  return request('GET', `/event/code/${eventId}/`);
}

export function setEventCode(eventId, code, expiration) {
  return request('PUT', `/event/code/${eventId}/`, { id: eventId, code, expiration });
}

export function getBlob(blobId) {
  return request('GET', `/upload/blobstore/${blobId}/`);
}

export function updateBlob(blobId, data) {
  return request('PUT', `/upload/blobstore/`, { id: blobId, data });
}

export function createBlob(blobId, data) {
  return request('POST', `/upload/blobstore/`, { id: blobId, data });
}
