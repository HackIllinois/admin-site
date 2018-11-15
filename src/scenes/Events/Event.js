import React from 'react';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import { deleteEvent } from '../../services/events/actions';
import { openEventEditor } from '../../services/ui/actions';

const styles = theme => ({
  card: {
    margin: '.8em 0',
  },
});

const Event = ({ event, deleteEvent, updateEvent, classes }) => (
  <Card className={classes.card} >
    <CardContent>
      <Typography>{event.name}</Typography>
      <Typography color="textSecondary" gutterBottom>{event.time}</Typography>
      <Typography component="p" gutterBottom>{event.desc}</Typography>
      <Button color="primary" onClick={() => updateEvent(event)}>Update</Button>
      <Button color="secondary" onClick={() => deleteEvent(event.id)}>delete</Button>
    </CardContent>
  </Card>
);

const mapDispatchToProps = (dispatch) => ({
  deleteEvent: (id) => dispatch(deleteEvent(id)),
  updateEvent: (event) => dispatch(openEventEditor(event)),
});

export default withStyles(styles)(connect(null, mapDispatchToProps)(Event));
