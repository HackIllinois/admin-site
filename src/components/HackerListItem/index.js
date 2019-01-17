import React from 'react';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles } from '@material-ui/core/styles';
import yellow from '@material-ui/core/colors/yellow';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';

import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';
import HelpOutline from '@material-ui/icons/HelpOutline';
import HighlightOff from '@material-ui/icons/HighlightOff';

const styles = {
  accept: {
    color: green[500],
  },
  reject: {
    color: red[500],
  },
  pending: {
    color: yellow[600],
  },
  decision: {

  }
};
  
const HackerIcon = (props) => {
  const { status, styles } = props;
  if (status === "PENDING") {
      return <HelpOutline className={styles.pending}/>;
  } else if (status === "ACCEPTED") {
      return <CheckCircleOutline className={styles.accept} />
  } else {
      return <HighlightOff className={styles.reject} />
  }
}
  
const HackerListItem = (props) => {
  const { classes } = props;
  return (
    <div>
      <ListItem>
          <HackerIcon status={props.status} styles={classes} />
          <ListItemText secondary={"Name: " + props.firstName + " " + props.lastName} primary={"ID: " + props.github} />
      </ListItem>
    </div>
  );
}
export default withStyles(styles)(HackerListItem);
