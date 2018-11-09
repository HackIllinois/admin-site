// Static counter variable for generating IDs while API isn't hoooked up
let counter = 1000000;

export const RECIEVE_EVENTS = 'RECIEVE_EVENTS';
export const recieveEvents = data => ({
  type: RECIEVE_EVENTS,
  events: data,
});

export function requestEvents() {
  return function(dispatch) {
    // Pass in dummy data until api endpoint is made, assumes data is already sorted chronologically
    const data = [{
        id: 1,
        name: 'Free McDoubles',
        time: '7:00',
        desc: 'All you can eat goodness.  No cheese included.'
      }, {
        id: 2,
        name: 'Elon Musk TED Talk',
        time: '7:01',
        desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
      }
    ]
    dispatch(recieveEvents(data));
  };
}

export const DELETE_EVENT_SUCCESSFUL = 'DELETE_EVENT_SUCCESSFUL';
export const deleteEventSuccessful = id => ({
  type: DELETE_EVENT_SUCCESSFUL,
  id,
});

export function deleteEvent(id) {
  return function(dispatch) {
    // Make request to api server, then call deleteEventSuccessful()
    dispatch(deleteEventSuccessful(id));
  }
}

export const CREATE_EVENT_SUCCESSFUL = 'CREATE_EVENT_SUCCESSFUL';
export const createEventSuccessful = event => ({
  type: CREATE_EVENT_SUCCESSFUL,
  event,
});

export function createEvent(event) {
  return function(dispatch) {
    // Make request to api server, then call createEventSuccessful()
    event.id = counter++;
    dispatch(createEventSuccessful(event));
  };
}

export const UPDATE_EVENT_SUCCESSFUL = 'UPDATE_EVENT_SUCCESSFUL';
export const updateEventSuccessful = event => ({
  type: UPDATE_EVENT_SUCCESSFUL,
  event,
});

export function updateEvent(event) {
  return function(dispatch) {
    // Make request to api server, then call updateEventSuccessful()
    dispatch(updateEventSuccessful(event));
  };
}
