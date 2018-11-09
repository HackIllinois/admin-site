import React from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';

import { requestEvents } from '../../services/events/actions';
import { openEventEditor } from '../../services/ui/actions';
import Event from './Event';
import EventEditor from './EventEditor';

class Events extends React.Component {
  componentDidMount() {
    this.props.requestEvents();
  }

  render() {
    return (
      <div>
        <Button onClick={() => this.props.openEventEditor()}>Create event</Button>
        <EventEditor />

        {this.props.events.map((event) => {
          return <Event key={event.name} event={event} />
        }
        )}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  events: state.events.events,
});

const mapDispatchToProps = (dispatch) => ({
  requestEvents: () => dispatch(requestEvents()),
  openEventEditor: () => dispatch(openEventEditor()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Events);
