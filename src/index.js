import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore, combineReducers } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

import checkinReducer from './services/checkin/reducer';
import eventsReducer from './services/events/reducer';
import registrationReducer from './services/registration/reducer';
import rsvpReducer from './services/rsvp/reducer';
import uiReducer from './services/ui/reducer';

import './reset.css';

const rootReducer = combineReducers({
  checkin: checkinReducer,
  events: eventsReducer,
  registration: registrationReducer,
  rsvp: rsvpReducer,
  ui: uiReducer,
});

const store = createStore(
  rootReducer,
  applyMiddleware(
    thunk,
    logger,
  )
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
