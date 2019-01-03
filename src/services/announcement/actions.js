export const SEND_ANNOUNCEMENT = 'SEND_ANNOUNCEMENT';

export const sendAnnouncement = (announcement = "") => ({
  type: SEND_ANNOUNCEMENT,
  announcement: announcement
});
