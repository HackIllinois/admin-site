import React from 'react';

import './style.scss';
import EventEditPopup from './EventEditPopup';
import Loading from 'components/Loading';
import Message from 'components/Message';
import { getEvents, getRoles } from 'util/api';
import { sortEventsIntoDays } from 'util/events';
import EventCard from './EventCard';

// When adding a new event, most of the field values default to empty strings, but we need
// to make sure that the start and end times are on the day which the add button was pressed on
function createBlankEventOnDate(date = new Date()) {
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

  render() {
    const { days, editingEvent, isLoading, error } = this.state;

    if (isLoading) {
      return <Loading />;
    }

    if (error) {
      return <Message>Error fetching data</Message>;
    }

    const isAdmin = getRoles().includes('Admin');
    return (
      <div className="events-page">
        {editingEvent &&
          <EventEditPopup
            event={editingEvent}
            onDismiss={() => this.setState({ editingEvent: null })}
            onUpdateEvent={() => this.reloadEvents()}
          />
        }

        {/* If there are no days, we still want to offer the ability to add events for admins */}
        {days.length === 0 && isAdmin && (
          <div className="day">
            <div className="day-of-week">No Events Found</div>
            <EventCard
              isAddButton
              onClick={() => this.setState({ editingEvent: createBlankEventOnDate() })}
              style={{ minWidth: 200 }}
            />
          </div>
        )}

        {days.map(day => (
          <div className="day" key={day.date.toString()}>
            <div className="day-of-week">{day.dayOfWeek}</div>
            <div className="date">{day.dateString}</div>
            <div className="underline"/>
            <div className="events">
              {
                day.events.map(event => (
                  <EventCard
                    event={event}
                    canEdit={isAdmin}
                    onClick={() => this.setState({ editingEvent: event })}
                    key={event.id}
                  />
                ))
              }

              {isAdmin &&
                <EventCard
                  isAddButton
                  onClick={() => this.setState({ editingEvent: createBlankEventOnDate(day.date) })}
                />
              }
            </div>
          </div>
        ))}
      </div>
    )
  }
}
