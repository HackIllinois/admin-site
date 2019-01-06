export const SAVE_ANNOUNCEMENT = 'SAVE_ANNOUNCEMENT';

export const saveAnnouncement = (announcement = "") => ({
  type: SAVE_ANNOUNCEMENT,
  announcement: announcement
});
