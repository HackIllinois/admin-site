import {
  TOGGLE_DRAWER,
  OPEN_EVENT_EDITOR,
  CLOSE_EVENT_EDITOR,
  HANDLE_EVENT_INPUT_CHANGE,
} from './actions';

const initialState = {
  drawerOpen: false,
  eventEditor: {
    isOpen: false,
    event: null,
  },
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_DRAWER:
      return Object.assign({}, state, { drawerOpen: !state.drawerOpen });
    case OPEN_EVENT_EDITOR:
      return Object.assign({}, state, { eventEditor: { isOpen: true,  event: action.event }});
    case CLOSE_EVENT_EDITOR:
      return Object.assign({}, state, { eventEditor: { isOpen: false, event: null }});
    case HANDLE_EVENT_INPUT_CHANGE:
      const newEvent = state.eventEditor.event;
      newEvent[action.field] = action.value;
      return Object.assign({}, state, { eventEditor: { event: newEvent, ...state.eventEditor }});
    default:
      return state;
  }
};

export default reducer;
