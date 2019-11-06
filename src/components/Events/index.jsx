import React from 'react';
import EventEditPopup from './EventEditPopup';
import { getEvents, sortEventsIntoDays } from './eventsUtil';

import './styles.scss';

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
              <div className="date">{day.date}</div>
              <div className="underline"/>
              <div className="events">
                {
                  day.events.map(event => (
                    <div className="event" key={event.name} onClick={() => this.setState({ editingEvent: event })}>
                      <div className="event-header">
                        <div className="event-name">{event.name}</div>
                        <div className="event-time">
                          <div className="start">{this.formatTime(event.startTime)}</div>
                          <div className="end">{this.formatTime(event.endTime)}</div>
                        </div>
                      </div>

                      <div className="event-details">
                        <div className="description">{event.description}</div>
                        <div className="locations">{event.locations.map(location => location.description).join(',')}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          ))
        }
      </div>
    )
  }
}