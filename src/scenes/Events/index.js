import React from 'react';
import { connect } from 'react-redux';

import { requestEvents } from '../../services/events/actions';
import Event from './Event';
import EventEditor from './EventEditor';
import TabBar from './TabBar';

import './style.css';

class Events extends React.Component {
  constructor() {
    super()
    this.tabs = [
      { name: 'Friday 22', date: 22 },
      { name: 'Saturday 23', date: 23 },
      { name: 'Sunday 24', date: 24 },
      { name: 'Other', date: null },
    ];
  }

  componentDidMount() {
    this.props.requestEvents();
  }

  render() {
    return (
      <div className={'events-body'}>
        <EventEditor />

        <div className='events-tab-bar'>
          <TabBar tabs={this.tabs} />
        </div>

        <div className={'events-contcont'}>
          <div className={'events-cont'}>
            {this.props.events.map((event) => {
              // Only display Event if startTime matches the tab date
              const startTime = new Date(event.startTime);
              const month = startTime.getMonth();
              const day = startTime.getDate();

              const isExactDay = month === 1 && day === this.tabs[this.props.tabIndex].date;
              const isOther = this.tabs[this.props.tabIndex].date === null;
              const isOtherDaySameMonth = month === 1 && (day < this.tabs[0].date || day > this.tabs[this.tabs.length - 2].date);
              const isDifferentMonth = month !== 1;
              if (isExactDay || (isOther && (isOtherDaySameMonth || isDifferentMonth))) {
                return <Event key={event.id} event={event} isOther={isOther} />
              } else {
                return null;
              }
            }
            )}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  events: state.events.events,
  tabIndex: state.ui.eventPageTabBarIndex,
});

const mapDispatchToProps = (dispatch) => ({
  requestEvents: () => dispatch(requestEvents()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Events);
