import {
  TOGGLE_DRAWER,
} from './actions';

const initialState = {
  drawerOpen: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_DRAWER:
      return Object.assign({}, state, { drawerOpen: !state.drawerOpen });
    default:
      return state;
  }
};

export default reducer;
