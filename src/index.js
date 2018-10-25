import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';

import checkinReducer from './services/checkin/reducer';
import eventsReducer from './services/events/reducer';
import registrationReducer from './services/registration/reducer';
import rsvpReducer from './services/rsvp/reducer';
import schoolReducer from './services/school/reducer';

const rootReducer = combineReducers({
  checkin: checkinReducer,
  events: eventsReducer,
  registration: registrationReducer,
  rsvp: rsvpReducer,
  school: schoolReducer
});

const store = createStore(rootReducer);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
