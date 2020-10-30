import React from 'react';

import './style.scss';
import Loading from 'components/Loading';
import Message from 'components/Message';
import Stats from 'components/Stats';
import { getStats, getRegistrations, getDecisions, getRsvps, getEvents, getEventTracker, getCheckins } from 'util/api';
import { addOtherData, filterRegistrations } from 'util/registrations';
import { StyledSelect } from 'components/SelectField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';

// The 'value' specifies the filters to apply to select the given group
const applicantGroups = [
  { label: 'All Applicants', value: [] },
  { label: 'Accepted', value: [
    { columnKey: 'status', value: 'ACCEPTED', multiple: false, exact: true, invert: false }
  ]},
  { label: 'Attending', value: [
    { columnKey: 'isAttending', value: 'true', multiple: false, exact: true, invert: false }
  ]},
  { label: 'Checked In', value: [
    { columnKey: 'checkedIn', value: 'true', multiple: false, exact: true, invert: false }
  ]},
];

// numbers from 1-10 (the wave numbers)
Array(10).fill(0).map((_, i) => i + 1).forEach(num => {
  applicantGroups.push({
    label: `Wave ${num}`,
    value: [{ columnKey: 'wave', value: String(num), multiple: false, exact: true, invert: false }]
  });
})

// The event types that we want counts for the number of people that check in
const countEventTypes = ['MEAL'];

export default class Statistics extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      error: false,
      stats: {},
      eventCounts: [],
      registrations: [],
      selectedGroup: applicantGroups[0],
      showStats: true, // hack to force rerender
    }
  }

  componentDidMount() {
    this.reload();
  }

  reload() {
    this.setState({ isLoading: true, error: false });
    Promise.all([getStats(), getEvents(), getRegistrations(), getDecisions(), getRsvps(), getCheckins()])
      .then(([stats, events, ...userData]) => [stats, events, addOtherData(...userData)])
      .then(([stats, events, registrations]) => {
        this.setState({ stats, registrations, isLoading: false });

        const eventsToCount = events
          .filter(event => countEventTypes.includes(event.eventType));

        const trackerRequests = eventsToCount
          .sort((a, b) => a.startTime - b.startTime)
          .map(event => getEventTracker(event.id));

        Promise.all(trackerRequests).then(trackers => {
          const eventCounts = trackers.map(tracker => ({
            name: eventsToCount.find(event => event.id === tracker.eventId).name,
            count: tracker.users.length,
          }));
          this.setState({ eventCounts });
        });
      })
      .catch(() => this.setState({ error: true }));
  }

  handleGroupSelect(selectedGroup) {
    this.setState({ selectedGroup, showStats: false }, () => {
      // hack to force rerender (frappe charts behave weirdly a lot)
      this.setState({ showStats: true }, () => {
        window.dispatchEvent(new Event('resize'));
      });
    });
  }

  render() {
    const { stats, eventCounts, registrations, selectedGroup, isLoading, error } = this.state;

    if (isLoading) {
      return <Loading />;
    }

    if (error) {
      return <Message>Error fetching data</Message>;
    }

    const filteredRegistrations = filterRegistrations(registrations, selectedGroup.value);

    const counts = {
      'Applicants': stats.decision.count,
      'RSVPs': stats.rsvp.count,
      'Checked In': stats.checkin.count,
      'Mentors': stats.registration.mentors.count
    };

    return (
      <div className="statistics-page">
        <div className="main-counts">
          {Object.entries(counts).map(([categoryName, count]) => (
            <div className="count-box" key={categoryName}>
              <div className="count">{count}</div>
              <div className="category">{categoryName}</div>
            </div>
          ))}
        </div>

        <div className="meal-counts">
          {eventCounts.map(({ name, count }) => (
            <div className="count-box" key={name}>
              <div className="count">{count}</div>
              <div className="category">{name}</div>
            </div>
          ))}
        </div>

        <div className="options">
          <StyledSelect
            className="group-select"
            value={selectedGroup}
            options={applicantGroups}
            onChange={selected => this.handleGroupSelect(selected)}
          />

          <FontAwesomeIcon className="reload-icon" icon={faSync} onClick={() => this.reload()}/>
        </div>

        {this.state.showStats && <Stats registrations={filteredRegistrations} />}
      </div>
    );
  }
}