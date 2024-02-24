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
    if (res.status === 204) {
      return {};
    } else if (res.ok) {
        return res.json();
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

export function makeDecision(decisions) {
  return request('PUT', '/admission/update', decisions);
}

export function finalizeDecision(id, finalized = true) {
  return request('POST', '/decision/finalize/', { id, finalized });
}

export function getEvents() {
  return request('GET', '/event/')
    .then(res => res.events).then((events) => events.filter((event) => !event.isStaff));
}

export function getStaffEvents() {
  return request('GET', '/event/staff/')
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

// export function getNotifications(topicIds) {
//   // using Promise.all to send web request for each topic so that they are sent simultaneously
//   const promises = topicIds.map(topicId => 
//     request('GET', `/notifications/topic/${topicId}/`)
//       .then(res => res.notifications || [])
//   );

//   return Promise.all(promises).then(notificationsById =>
//     notificationsById.reduce((allNotifications, notifications) => allNotifications.concat(notifications), [])
//   );
// }

export function getNotifications() {
  return request('GET', '/notification/');
}

export function sendNotification(notification) {
  return request('POST', `/notification/send/`, notification);
}

export function sendNotificationAll(notification) {
  delete notification.role;
  notification.foodWave = 0;
  let not2 = {...notification};
  not2.foodWave = 1;
  return Promise.all([
    request('POST', `/notification/send/`, notification),
    request('POST', `/notification/send/`, not2)
  ]);
};

export function getRegistration(id) {
  return request('GET', `/registration/userid/${id}`);
}

export function getStats() {
  return request('GET', '/stat/');
}

export function getRsvps() {
  return request('GET', '/admission/rsvp/');
}

export function getCheckins() {
  return request('GET', '/checkin/list/')
    .then(res => res.checkedInUsers);
}

export function getEventCodeExpiration(eventId) {
  return request('GET', `/event/metadata/${eventId}/`);
}

export function setEventCodeExpiration(eventId, isStaff, exp) {
  return request('PUT', `/event/metadata/`, { eventId, isStaff, exp });
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

export function getShop() {
  return request('GET', `/shop`);
}

export function getShopQRs(itemId) {
  return request('GET', `/shop/item/qr/${itemId}`)
}

export function createShopItem(setName, setPrice, setIsRaffle, setQuantity, setImageUrl) {
  return request('POST', `/shop/item`, {name: setName, price: setPrice, isRaffle: setIsRaffle, quantity: setQuantity, imageUrl: setImageUrl});
}

export function updateShopItem(itemId, setName, setPrice, setIsRaffle, setImageUrl) {
  return request('PUT', `/shop/item/${itemId}`, {name: setName, price: setPrice, isRaffle: setIsRaffle, imageUrl: setImageUrl});
}