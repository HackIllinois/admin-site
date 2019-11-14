const API = 'https://hackillinois-mock-api.netlify.com';

export async function getNotificationTopics() {
  const data = await fetch(`${API}/notifications/topic/`, {
    method: 'GET',
  });
  const json = await data.json();
  return json.topics;
}

export async function getNotifications() {
  const data = await fetch(`${API}/notifications/topic/all/`, {
    method: 'GET',
  });
  const json = await data.json();
  return json.notifications;
}

export async function sendNotification(notification, topic) {
  const result = await fetch(`${API}/notifications/topic/${topic}/`, {
    method: 'POST',
    body: JSON.stringify(notification),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return await result.json();
}

export async function removeNotificationTopic(topic) {
  const result = await fetch(`${API}/notifications/topic/${topic}/`, {
    method: 'DELETE'
  });
  return await result.json();
}

export async function addNotificationTopic(topic) {
  const result = await fetch(`${API}/notifications/topic/`, {
    method: 'POST',
    body: JSON.stringify({ id: topic })
  });
  return await result.json();
}
