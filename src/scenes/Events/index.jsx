import React from 'react';

import './style.scss';
import EventEditPopup from './EventsEditPopup';
import Loading from 'components/Loading';
import Message from 'components/Message';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { getEvents, getRoles } from 'util/api';
import { sortEventsIntoDays } from 'util/events';

// When adding a new event, most of the field values default to empty strings, but we need
// to make sure that the start and end times are on the day which the add button was pressed on
function createBlankEventOnDate(date) {
  const secondsUntilNoon = 12 * 60 * 60;
  const time = Math.floor(date.getTime() / 1000) + secondsUntilNoon;
  return { startTime: time, endTime: time };
}

export default class Events extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      error: false,
      days: [],
      editingEvent: null,
    }
  }

  componentDidMount() {
    this.reloadEvents();
  }

  reloadEvents() {
    getEvents().then(events => {
      this.setState({ days: sortEventsIntoDays(events), isLoading: false });
    }).catch(() => {
      this.setState({ error: true, isLoading: false });
    });
  }

  formatTime(seconds) {
    return new Date(seconds * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric'});
  }

  calculateDayDifference(event) {
    const startDay = new Date(event.startTime * 1000);
    const endDay = new Date(event.endTime * 1000);
    startDay.setHours(0, 0, 0, 0);
    endDay.setHours(0, 0, 0, 0);

    const difference = Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
    const prefix = (difference < 0) ? '-' : '+';
    if (difference !== 0) {
      return prefix + Math.abs(difference);
    }
    return '';
  }

  render() {
    const { days, editingEvent, isLoading, error } = this.state;

    if (isLoading) {
      return <Loading />;
    }

    if (error) {
      return <Message>Error fetching data</Message>;
    }

    const isAdmin = getRoles().includes('Admin');
    const className = 'events-page' + (isAdmin ? ' admin' : '');
    return (
      <div className={className}>
        {editingEvent &&
          <EventEditPopup
            event={editingEvent}
            onDismiss={() => this.setState({ editingEvent: null })}
            onUpdateEvent={() => this.reloadEvents()}
          />
        }

        {days.map(day => (
          <div className="day" key={day.date}>
            <div className="day-of-week">{day.dayOfWeek}</div>
            <div className="date">{day.dateString}</div>
            <div className="underline"/>
            <div className="events">
              {
                day.events.map(event => (
                  <div
                    className="event"
                    key={event.id}
                    onClick={() => isAdmin && this.setState({ editingEvent: event })}>
                      <div className="event-header">
                        <div className="event-name">{event.name}</div>
                        <div className="event-time">
                          <div className="start">{this.formatTime(event.startTime)}</div>
                          <div className="end">
                            {this.formatTime(event.endTime)}
                            <span className="day-difference">{this.calculateDayDifference(event)}</span>
                          </div>
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

              {isAdmin &&
                <div className="event" onClick={() => this.setState({ editingEvent: createBlankEventOnDate(day.date) })}>
                  <FontAwesomeIcon className="add-event-icon" icon={faPlus}/>
                </div>
              }
            </div>
          </div>
        ))}
      </div>
    )
  }
}
