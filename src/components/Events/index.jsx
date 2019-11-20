import React from 'react';
import EventEditPopup from 'components/EventsEditPopup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { getEvents } from 'api';
import { sortEventsIntoDays } from './eventsUtil';

import './styles.scss';

// When adding a new event, most of the field values default to empty strings, but we need
// to make sure that the start and end times are on the day which the add button was pressed on
function createBlankEventOnDate(date) {
  const time = Math.floor(date.getTime() / 1000);
  return { startTime: time, endTime: time };
}

export default class Events extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      days: [],
      editingEvent: null,
    }
  }

  componentDidMount() {
    this.reloadEvents();
  }

  reloadEvents() {
    getEvents().then(events => {
      this.setState({ days: sortEventsIntoDays(events) });
    });
  }

  formatTime(seconds) {
    return new Date(seconds * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric'});
  }

  render() {
    return (
      <div className="events-page">
        { 
          this.state.editingEvent &&
            <EventEditPopup
              event={this.state.editingEvent}
              onDismiss={() => this.setState({ editingEvent: null })}
              onUpdateEvent={() => this.reloadEvents()}
            />
        }
        {
          this.state.days.map(day => (
            <div className="day" key={day.date}>
              <div className="day-of-week">{day.dayOfWeek}</div>
              <div className="date">{day.dateString}</div>
              <div className="underline"/>
              <div className="events">
                {
                  day.events.map(event => (
                    <div className="event" key={event.id} onClick={() => this.setState({ editingEvent: event })}>
                      <div className="event-header">
                        <div className="event-name">{event.name}</div>
                        <div className="event-time">
                          <div className="start">{this.formatTime(event.startTime)}</div>
                          <div className="end">{this.formatTime(event.endTime)}</div>
                        </div>
                      </div>

                      <div className="event-details">
                        <div className="description">{event.description}</div>
                        <div className="locations">
                          {(event.locations || []).map(location => location.description).join(', ')}
                        </div>
                      </div>
                    </div>
                  ))
                }

                <div className="event" onClick={() => this.setState({ editingEvent: createBlankEventOnDate(day.date) })}>
                  <FontAwesomeIcon className="add-event-icon" icon={faPlus}/>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    )
  }
}