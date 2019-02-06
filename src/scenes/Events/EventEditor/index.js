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
  time: '',
  desc: '',
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
            id="time"
            label="Time"
            value={this.state.event.time}
            onChange={this.handleChange('time')}
            className={classes.textField}
          />
          <TextField
            id="desc"
            label="Description"
            value={this.state.event.desc}
            onChange={this.handleChange('desc')}
            className={classes.textField}
            multiline
            rows="4"
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
