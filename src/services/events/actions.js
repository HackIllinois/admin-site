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
        // Assign ID to each event
        let events = json.events;
        // Convert null to empty array if no events exist
        if(events === null) {
          events = [];
        }
        events.forEach((event) => {
          // Add location property to event (For ui purposes)
          event.id = counter++;
          if(event.latitude === 40.113916) {
            event.location = { name: 'Siebel Center', latitude: 40.113916, longitude: -88.224861 };
          } else if(event.latitude === 40.114971) {
            event.location = { name: 'ECEB', latitude: 40.114971, longitude: -88.228072 };
          } else if(event.latitude === 40.113065) {
            event.location = { name: 'Kenney Gym', latitude: 40.113065, longitude: -88.227651 }
          } else {
            // Location was assigned somewhere other than this app, copy lat and long into var
            event.location = { name: `${event.latitude}, ${event.longitude}`, latitude: event.latitude, longitude: event.longitude };
          }
        });
        dispatch(recieveEvents(events));
      });
  };
}

export const DELETE_EVENT_SUCCESSFUL = 'DELETE_EVENT_SUCCESSFUL';
export const deleteEventSuccessful = id => ({
  type: DELETE_EVENT_SUCCESSFUL,
  id,
});

export function deleteEvent(name, id) {
  return function(dispatch, getState) {
    return fetch(`/api/event/${name}/`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': getState().auth.jwt,
      }
    })
      .then(
        res => res.json(),
        err => {
        }
      )
      .then((json) => {
        dispatch(deleteEventSuccessful(id));
      });
  }
}

export const CREATE_EVENT_SUCCESSFUL = 'CREATE_EVENT_SUCCESSFUL';
export const createEventSuccessful = event => ({
  type: CREATE_EVENT_SUCCESSFUL,
  event,
});

export function createEvent(event) {
  return function(dispatch, getState) {
    // event.id = counter++;
    // dispatch(createEventSuccessful(event));
    return fetch(`/api/event/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': getState().auth.jwt,
      },
      body: JSON.stringify(event),
    })
      .then(
        res => res.json(),
        err => {
        }
      )
      .then((json) => {
        json.id = counter++;
        json.location = event.location;
        console.log(json);
        dispatch(createEventSuccessful(json));
      });
  };
}

export const UPDATE_EVENT_SUCCESSFUL = 'UPDATE_EVENT_SUCCESSFUL';
export const updateEventSuccessful = event => ({
  type: UPDATE_EVENT_SUCCESSFUL,
  event,
});

export function updateEvent(event) {
  return function(dispatch, getState) {
    // event.id = counter++;
    // dispatch(createEventSuccessful(event));
    return fetch(`/api/event/`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': getState().auth.jwt,
      },
      body: JSON.stringify(event),
    })
      .then(
        res => res.json(),
        err => {
        }
      )
      .then((json) => {
        json.location = event.location;
        json.id = event.id
        dispatch(updateEventSuccessful(json));
      });
  };
}
