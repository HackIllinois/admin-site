import {
  RECIEVE_EVENTS,
  DELETE_EVENT_SUCCESSFUL,
  CREATE_EVENT_SUCCESSFUL,
  UPDATE_EVENT_SUCCESSFUL,
} from './actions';

const initialState = {
  events: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case RECIEVE_EVENTS:
      return Object.assign({}, state, { events: action.events });
    case DELETE_EVENT_SUCCESSFUL:
      const newDeleteEvents = state.events.filter((event) => (
        event.id !== action.id
      ));
      return Object.assign({}, state, { events: newDeleteEvents });
    case CREATE_EVENT_SUCCESSFUL:
      return Object.assign({}, state, { events: [...state.events, Object.assign({}, action.event)] });
    case UPDATE_EVENT_SUCCESSFUL:
      // Deep copy events array, or redux won't update correctly
      // const newUpdateEvents = Array.from(state.events);
      // for(let i = 0; i < newUpdateEvents.length; i++) {
      //   if(newUpdateEvents[i].id === action.event.id) {
      //     // Deep copy event or redux won't update correctly
      //     newUpdateEvents[i] = Object.assign({}, action.event);
      //     break;
      //   }
      // }
      const newUpdateEvents = state.events.map(event => {
        if(event.id === action.event.id) {
          return Object.assign({}, action.event);
        } else {
          return event;
        }
      });
      return Object.assign({}, state, { events: newUpdateEvents });
    default:
      return state;
  }
};

export default reducer;
