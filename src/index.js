import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore, combineReducers } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

import App from './App';
import registerServiceWorker from './registerServiceWorker';

import announcementReducer from './services/announcement/reducer';
import authReducer from './services/auth/reducer';
import { setJWT } from './services/auth/actions';
import checkinReducer from './services/checkin/reducer';
import eventsReducer from './services/events/reducer';
import rsvpReducer from './services/rsvp/reducer';
import uiReducer from './services/ui/reducer';
import userReducer from './services/user/reducer';

import './reset.css';

const rootReducer = combineReducers({
  announcement: announcementReducer,
  auth: authReducer,
  checkin: checkinReducer,
  events: eventsReducer,
  rsvp: rsvpReducer,
  ui: uiReducer,
  user: userReducer
});

const store = createStore(
  rootReducer,
  applyMiddleware(
    thunk,
    logger,
  )
);

// Change to material-ui updated typography
window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true;

// Use admin token from environment variables in development
// since OAuth won't work with local api instance
if (process.env.NODE_ENV === "development") {
  store.dispatch(setJWT(process.env.REACT_APP_TOKEN));
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
