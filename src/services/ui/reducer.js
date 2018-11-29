import {
  TOGGLE_DRAWER,
  OPEN_EVENT_EDITOR,
  CLOSE_EVENT_EDITOR,
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
    default:
      return state;
  }
};

export default reducer;
