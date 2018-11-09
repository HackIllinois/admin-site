import React from 'react';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { deleteEvent } from '../../../services/events/actions';
import { openEventEditor } from '../../../services/ui/actions';

const Event = ({ event, deleteEvent, updateEvent }) => (
  <Card>
    <CardContent>
      <Typography>{event.name}</Typography>
      <Typography color="textSecondary" gutterBottom>{event.time}</Typography>
      <Typography component="p" gutterBottom>{event.desc}</Typography>
      <Button color="primary" onClick={() => deleteEvent(event.id)}>delete</Button>
      <Button color="secondary" onClick={() => updateEvent(event)}>Update</Button>
    </CardContent>
  </Card>
);

const mapDispatchToProps = (dispatch) => ({
  deleteEvent: (id) => dispatch(deleteEvent(id)),
  updateEvent: (event) => dispatch(openEventEditor(event)),
});

export default connect(null, mapDispatchToProps)(Event);
