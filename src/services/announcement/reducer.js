import {
  SAVE_ANNOUNCEMENT,
  UPDATE_SELECTED_TOPIC,
  GET_NOTIFICATION_SUCCESS,
} from './actions';

const initialState = {
  announcement: '',
  selectedTopic: '',
  title: '',
  topics: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SAVE_ANNOUNCEMENT:
      return Object.assign({}, state, { announcement: action.announcement, title: action.title});
    case UPDATE_SELECTED_TOPIC:
      return Object.assign({}, state, { selectedTopic: action.selectedTopic});
    case GET_NOTIFICATION_SUCCESS:
      return Object.assign({}, state, { topics: action.topics});
    default:
      return state;
  }
};

export default reducer;
