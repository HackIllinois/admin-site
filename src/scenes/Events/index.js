import React from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import { requestEvents } from '../../services/events/actions';
import { openEventEditor } from '../../services/ui/actions';
import Event from './Event';
import EventEditor from './EventEditor';

import './style.css';

const styles = theme => ({
  button: {
    margin: '.8em 0',
  },
});


class Events extends React.Component {
  componentDidMount() {
    this.props.requestEvents();
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={'events-body'}>
        <Button 
          onClick={() => this.props.openEventEditor()}
          variant="contained"
          color="primary"
          className={classes.button}
        >Create event</Button>
        <EventEditor />

        <div className={'events-contcont'}>
          <div className={'events-cont'}>
            {this.props.events.map((event) => {
              return <Event key={event.id} event={event} />
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
});

const mapDispatchToProps = (dispatch) => ({
  requestEvents: () => dispatch(requestEvents()),
  openEventEditor: () => dispatch(openEventEditor()),
});

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Events));
