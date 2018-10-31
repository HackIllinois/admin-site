import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MailIcon from '@material-ui/icons/Mail';
import AnnouncementIcon from '@material-ui/icons/Announcement';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import EventsIcon from '@material-ui/icons/Event';

import { toggleDrawer } from '../../services/session/actions';

const styles = {
  list: {
    width: 250,
  },
};

class TemporaryDrawer extends React.Component {

  // Switch statement used in render to assign icons
  renderSwitch(text) {
    switch(text) {
      case 'Stats':
        return <TrendingUpIcon />;
      case 'Send email':
        return <MailIcon />;
      case 'Events':
        return <EventsIcon />;
      case 'Announcements':
        return <AnnouncementIcon />;
      default:
        return null;
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <Drawer open={this.props.isOpen} onClose={() => this.props.toggle()} anchor="left">
        <div className={classes.list}>
          <List>
            {['Stats', 'Send email', 'Events', 'Announcements'].map((text) => (
              <ListItem button key={text}>
                <ListItemIcon>{this.renderSwitch(text)}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </div>
      </Drawer>
    )
  }
}

const mapStateToProps = (state) => ({
  isOpen: state.session.drawerOpen,
});

const mapDispatchToProps = (dispatch) => ({
  toggle: () => dispatch(toggleDrawer()),
});

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(TemporaryDrawer));
