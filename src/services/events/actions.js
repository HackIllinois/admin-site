import fetch from 'cross-fetch';
// Static counter variable to generate IDs for each event since the API doesn't supply one
let counter = 1000000;

export const RECIEVE_EVENTS = 'RECIEVE_EVENTS';
export const recieveEvents = data => ({
  type: RECIEVE_EVENTS,
  events: data,
});

export function requestEvents() {
  return function(dispatch) {
    return fetch(`/api/event/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
      .then(
        res => res.json(),
        err => {

        }
      )
      .then((json) => {
        dispatch(recieveEvents(json.events));
      });
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
