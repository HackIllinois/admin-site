import React from 'react';
import { connect } from 'react-redux';
import Drawer from '@material-ui/core/Drawer';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

import { closeEventEditor } from '../../../services/ui/actions';
import { updateEvent, createEvent } from '../../../services/events/actions';

import './style.css';

const emptyEvent = {
  name: '',
  description: '',
  startTime: '2019-02-22T10:30',
  endTime: '2019-02-22T11:30',
  locationDescription: '',
  location: {
    name: 'Siebel Center',
    latitude: 40.113916,
    longitude: -88.224861,
  },
  sponsor: '',
  eventType: 'MEAL',
  id: -1,
};

const styles = theme => ({
  textField: {
    margin: '7px 0',
    width: '40vh'
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
    let newEvent;
    if(props.event) {
      newEvent = Object.assign({}, props.event);
      const st = new Date(newEvent.startTime);
      newEvent.startTime = `${st.getFullYear()}-${(st.getMonth()+1).toString().padStart(2, '0')}-${st.getDate().toString().padStart(2, '0')}T${st.getHours().toString().padStart(2, '0')}:${st.getMinutes().toString().padStart(2, '0')}`;
      const et = new Date(newEvent.endTime);
      newEvent.endTime = `${et.getFullYear()}-${(et.getMonth()+1).toString().padStart(2, '0')}-${et.getDate().toString().padStart(2, '0')}T${et.getHours().toString().padStart(2, '0')}:${et.getMinutes().toString().padStart(2, '0')}`;
    }
    const newState =  {
      event: props.event ? newEvent : Object.assign({}, emptyEvent),
      isNew: !props.event,
    };
    return newState;
  }

  handleChange(field) {
    return (e) => {
      const curEvent = this.state.event;
      curEvent[field] = e.target.value;
      this.setState({ event: curEvent });
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    // Convert date strings to milliseconds since epoch
    const submitEvent = Object.assign({}, this.state.event);
    submitEvent.startTime = Date.parse(this.state.event.startTime);
    submitEvent.endTime = Date.parse(this.state.event.endTime);
    submitEvent.longitude = submitEvent.location.longitude;
    submitEvent.latitude = submitEvent.location.latitude;
    console.log(submitEvent)

    if(submitEvent.name === '' ||
       submitEvent.description === '' ||
       submitEvent.sponser === '' ||
       submitEvent.locationDescription === ''
      ) {
      return;
    }

    if(this.state.isNew) {
      this.props.create(submitEvent);
    } else {
      this.props.update(submitEvent);
    }
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
            rows="6"
          />
          <FormControl>
            <InputLabel htmlFor="location">Location</InputLabel>
            <Select
              value={this.state.event.location.name}
              onChange={this.handleChange('location')}
              className={classes.textField}
              inputProps={{
                name: 'location',
                id: 'location',
              }}
              renderValue={(value) => <p>{value}</p>}
            >
              <MenuItem value={{ name: 'Siebel Center', latitude: 40.113916, longitude: -88.224861 }}>Siebel Center</MenuItem>
              <MenuItem value={{ name: 'ECEB', latitude: 40.114971, longitude: -88.228072 }}>ECEB</MenuItem>
              <MenuItem value={{ name: 'Kenney Gym', latitude: 40.113065, longitude: -88.227651 }}>Kenney Gym</MenuItem>
            </Select>
          </FormControl>
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
          <FormControl>
            <InputLabel htmlFor="eventType">Event Type</InputLabel>
            <Select
              value={this.state.event.eventType}
              onChange={this.handleChange('eventType')}
              className={classes.textField}
              inputProps={{
                name: 'eventType',
                id: 'eventType',
              }}
              renderValue={(value) => <p>{value.charAt(0) + value.slice(1).toLowerCase()}</p>}
            >
              <MenuItem value="MEAL">Meal</MenuItem>
              <MenuItem value="SPEAKER">Speaker</MenuItem>
              <MenuItem value="WORKSHOP">Workshop</MenuItem>
              <MenuItem value="MINIEVENT">Minievent</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>
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
