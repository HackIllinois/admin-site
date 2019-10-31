import React from 'react';
import { getEvents, sortEventsIntoDays } from './events';

import './styles.scss';

export default class Events extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      days: [],
    }
  }

  componentDidMount() {
    getEvents().then(events => {
      console.log(events);
      this.setState({ days: sortEventsIntoDays(events) });
    });
  }

  render() {
    return (
      <div className="events-page">
        {
          this.state.days.map(day => (
            <div className="day" key={day.date}>
              <div className="day-of-week">{day.dayOfWeek}</div>
              <div className="events">
                {
                  day.events.map(event => (
                    <div className="event" key={event.name}>
                      {event.name}
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