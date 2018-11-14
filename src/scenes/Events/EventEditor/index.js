import React from 'react';
import { connect } from 'react-redux';
import Drawer from '@material-ui/core/Drawer';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { closeEventEditor } from '../../../services/ui/actions';
import { updateEvent, createEvent } from '../../../services/events/actions';

const emptyEvent = {
  name: '',
  time: '',
  desc: '',
  id: -1,
};

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
    return (
      <Drawer open={this.props.isOpen} onClose={() => this.props.close()} anchor="right">
        <form autoComplete="off" onSubmit={this.handleSubmit}>
          <TextField
            id="name"
            label="Name"
            value={this.state.event.name}
            onChange={this.handleChange('name')}
          />
          <TextField
            id="time"
            label="Time"
            value={this.state.event.time}
            onChange={this.handleChange('time')}
          />
          <TextField
            id="desc"
            label="Description"
            value={this.state.event.desc}
            onChange={this.handleChange('desc')}
          />
          <Button type="submit">Submit</Button>
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

export default connect(mapStateToProps, mapDispatchToProps)(EventEditor);
