export const TOGGLE_DRAWER = 'TOGGLE_DRAWER';
export const toggleDrawer = () => ({
  type: TOGGLE_DRAWER,
});

/** Used for both creating new events and editing existing events.
  * 
  * @param event    The event being edited, or null if creating a new event
  */
export const OPEN_EVENT_EDITOR = 'OPEN_EVENT_EDITOR';
export const openEventEditor = (event=null) => {
  return {
    type: OPEN_EVENT_EDITOR,
    event,
  };
};

export const CLOSE_EVENT_EDITOR = 'CLOSE_EVENT_EDITOR';
export const closeEventEditor = () => ({
  type: CLOSE_EVENT_EDITOR,
});
