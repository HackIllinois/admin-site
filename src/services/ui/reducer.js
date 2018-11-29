import {
  TOGGLE_DRAWER,
  OPEN_EVENT_EDITOR,
  CLOSE_EVENT_EDITOR,
  CHANGE_EVENT_PAGE_TAB_BAR_INDEX,
} from './actions';

const initialState = {
  drawerOpen: false,
  eventEditor: {
    isOpen: false,
    event: null,
  },
  eventPageTabBarIndex: 0,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_DRAWER:
      return Object.assign({}, state, { drawerOpen: !state.drawerOpen });
    case OPEN_EVENT_EDITOR:
      return Object.assign({}, state, { eventEditor: { isOpen: true,  event: action.event }});
    case CLOSE_EVENT_EDITOR:
      return Object.assign({}, state, { eventEditor: { isOpen: false, event: null }});
    case CHANGE_EVENT_PAGE_TAB_BAR_INDEX:
      return Object.assign({}, state, { eventPageTabBarIndex: action.index });
    default:
      return state;
  }
};

export default reducer;
