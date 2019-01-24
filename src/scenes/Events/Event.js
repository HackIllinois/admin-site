import React from 'react';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';

import { deleteEvent } from '../../services/events/actions';
import { openEventEditor } from '../../services/ui/actions';

const styles = theme => ({
  card: {
    margin: '.8em 0',
    width: '60%',
    margin: '1em 1em'
  },
  eventName: {
    display: 'block',
  },
  date: {
    display: 'block',
    marginLeft: '100%',
  },
  label: {
    display: 'inline',
    fontWeight: 'bold',
  },
  labeled: {
    display: 'inline',
  },
  locDesc: {
    fontSize: '1.1em',
  },
  desc: {
    marginTop: '2em',
    marginBottom: '1em',
  },
  divider: {
    marginBottom: '.6em',
  },
  button: {
    marginRight: '1.5em',
  },
  timeString: {
    fontSize: '1.4em',
  }
});

const Event = ({ event, deleteEvent, updateEvent, classes, isOther }) => {
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  const timeString = `${startTime.getHours()}:${startTime.getMinutes()} - ${endTime.getHours()}:${endTime.getMinutes()}`;
  return (
    <Card className={classes.card} >
      <CardContent>
        <div className="event-header-cont">
          <div className="eventname-cont">
            <Typography variant="h4" className={classes.eventName}>{event.name}</Typography>
          </div>
          <div className="event-time-cont">
            { isOther && <Typography className={classes.date}>{startTime.toLocaleDateString()}</Typography> }
            <Typography className={classes.timeString}>{timeString}</Typography>
          </div>
        </div>
        <Typography component="h6" color="textSecondary" className={classes.locDesc} gutterBottom>{event.locationDescription}</Typography>
        <Typography component="p" className={classes.desc} gutterBottom>{event.description}</Typography>
        <Divider className={classes.divider}/>
        <div>
          <Typography className={classes.label}>Type:   </Typography>        
          <Typography className={classes.labeled}>{event.eventType.charAt(0) + event.eventType.slice(1).toLowerCase()}</Typography>
        </div>
        <div>
          <Typography className={classes.label}>Sponsor:   </Typography>        
          <Typography className={classes.labeled}>{event.sponsor}</Typography>
        </div>
        <div className='event-button-cont'>
          <Button color="primary" variant="contained" onClick={() => updateEvent(event)} className={classes.button}>Update</Button>
          <Button color="secondary" variant="contained" onClick={() => deleteEvent(event.name, event.id)}>delete</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const mapDispatchToProps = (dispatch) => ({
  deleteEvent: (name, id) => dispatch(deleteEvent(name, id)),
  updateEvent: (event) => dispatch(openEventEditor(event)),
});

export default withStyles(styles)(connect(null, mapDispatchToProps)(Event));
