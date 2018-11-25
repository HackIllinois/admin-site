import React from 'react';
import { connect } from 'react-redux';
import Drawer from '@material-ui/core/Drawer';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import { closeEventEditor } from '../../../services/ui/actions';
import { updateEvent, createEvent } from '../../../services/events/actions';

import './style.css';

const emptyEvent = {
  name: '',
  description: '',
  startTime: '2019-04-24T10:30',
  endTime: '2019-04-24T11:30',
  locationDescription: '',
  sponsor: '',
  eventType: '',
  id: -1,
};

const styles = theme => ({
  textField: {
    margin: '5px 0',
    width: '30vh'
  },
});

class EventEditor extends React.Component {
  constructor() {
    super();
    this.state = {
      event: Object.assign({}, emptyEvent),
      isNew: true,
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    // If prop hasn't change, don't edit state
    if((props.event === null && state.event.id === -1) || (props.event && (props.event.id === state.event.id))) {
      return state;
    }
    const newState =  {
      event: props.event ? props.event : Object.assign({}, emptyEvent),
      isNew: !props.event,
    };
    return newState;
  }

  handleChange(field) {
    return (e) => {
      const curEvent = this.state.event;
      curEvent[field] = e.target.value;
      console.log(curEvent);
      this.setState({ event: curEvent });
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    if(this.state.isNew) {
      this.props.create(this.state.event);
    } else {
      this.props.update(this.state.event);
    }
    // // Reset state
    // this.setState({ event: emptyEvent, isNew: true });
  }

  render() {
    const { classes } = this.props;
    return (
      <Drawer open={this.props.isOpen} onClose={() => this.props.close()} anchor="right" className={classes.drawer}>
        <form autoComplete="off" onSubmit={this.handleSubmit} className="event-editor-form">
          <TextField
            id="name"
            label="Name"
            value={this.state.event.name}
            onChange={this.handleChange('name')}
            className={classes.textField}
          />
          <TextField
            id="startTime"
            label="Start Time"
            type="datetime-local"
            value={this.state.event.startTime}
            onChange={this.handleChange('startTime')}
            className={classes.textField}
          />
          <TextField
            id="endTime"
            label="End Time"
            type="datetime-local"
            value={this.state.event.endTime}
            onChange={this.handleChange('endTime')}
            className={classes.textField}
          />
          <TextField
            id="description"
            label="Description"
            value={this.state.event.description}
            onChange={this.handleChange('description')}
            className={classes.textField}
            multiline
            rows="4"
          />
          <TextField
            id="locationDescription"
            label="Location Description"
            value={this.state.event.locationDescription}
            onChange={this.handleChange('locationDescription')}
            className={classes.textField}
          />
          <TextField
            id="sponsor"
            label="Sponsor"
            value={this.state.event.sponsor}
            onChange={this.handleChange('sponsor')}
            className={classes.textField}
          />
          <TextField
            id="eventType"
            label="Event Type"
            value={this.state.event.eventType}
            onChange={this.handleChange('eventType')}
            className={classes.textField}
          />
          <div className='event-editor-button-cont'>
            <Button type="submit" color="primary" variant="contained">Submit</Button>
          </div>
        </form>
      </Drawer>
    )
  }
}

const mapStateToProps = (state) => ({
  isOpen: state.ui.eventEditor.isOpen,
  event: state.ui.eventEditor.event,
});

const mapDispatchToProps = (dispatch) => ({
  close: () => dispatch(closeEventEditor()),
  create: (event) => {
    dispatch(closeEventEditor());
    dispatch(createEvent(event));
  },
  update: (event) => {
    dispatch(closeEventEditor());
    dispatch(updateEvent(event));
  },
});

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(EventEditor));
