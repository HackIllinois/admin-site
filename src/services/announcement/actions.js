import { fetchNotificationTopics, pushAnnouncement } from 'services/api/announcement';

export const SAVE_ANNOUNCEMENT = 'SAVE_ANNOUNCEMENT';
export const SEND_ANNOUNCEMENT = 'SEND_ANNOUNCEMENT';
export const SEND_ANNOUNCEMENT_FAILURE = 'SEND_ANNOUNCEMENT_FAILURE';
export const SEND_ANNOUNCEMENT_SUCCESS = 'SEND_ANNOUNCEMENT_SUCCESS';

export const GET_NOTIFICATION_REQUEST = 'GET_NOTIFICATION_REQUEST';
export const GET_NOTIFICATION_SUCCESS = 'GET_NOTIFICATION_SUCCESS';
export const GET_NOTIFICATION_FAILURE = 'GET_NOTIFICATION_FAILURE';
export const UPDATE_SELECTED_TOPIC = 'UPDATE_SELECTED_TOPIC';

export function saveAnnouncement(announcement = "") {
  return {
    type: SAVE_ANNOUNCEMENT,
    announcement: announcement
  }
}

export function sentAnnouncement(announcement, topic) {
  return {
    type: SEND_ANNOUNCEMENT,
    announcement: announcement,
    topic: topic
  }
}

export function sendAnnouncement(announcement, topic, token) {
  return (dispatch) => {
    dispatch(sentAnnouncement(announcement, topic));
    pushAnnouncement(announcement, topic, token)
      .then(data => dispatch(sendAnnouncementResponse(false, data)))
      .catch(err => dispatch(sendAnnouncementResponse(true, null)));
  };
}

export function sendAnnouncementResponse(err) {
  if (err)
    return { type: SEND_ANNOUNCEMENT_FAILURE };
  return {
    type: SEND_ANNOUNCEMENT_SUCCESS,
  };
}


export function updateSelectedNotification(notification) {
  return {
    type: UPDATE_SELECTED_TOPIC,
    selectedTopic: notification,
  }
}


export function requestNotificationTopic() {
  return {
    type: GET_NOTIFICATION_REQUEST,
  }
}

function receiveNotificationTopic(err, Notification) {
  if (err)
    return { type: GET_NOTIFICATION_FAILURE };
  return {
    type: GET_NOTIFICATION_SUCCESS,
    topics: Notification,
  };
}


export function getNotification(token) {
  return (dispatch) => {
    dispatch(requestNotificationTopic());
    fetchNotificationTopics(token)
      .then(data => dispatch(receiveNotificationTopic(false, data)))
      .catch(err => dispatch(receiveNotificationTopic(true, null)));
  };
}
