import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { changeEventPageTabBarIndex } from 'services/ui/actions';

const styles = {
  root: {
    width: '60%',
  }
};

class TabBar extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <Paper className={classes.root}>
        <Tabs
          value={this.props.value}
          onChange={(e, val) => this.props.changeTab(val)}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
        {
          this.props.tabs.map(tab => (
            <Tab key={tab.name} label={tab.name} />
          ))
        }     
        </Tabs>
      </Paper>
    );
  }
}

const mapStateToProps = state => ({
  value: state.ui.eventPageTabBarIndex,
});

const mapDispatchToProps = dispatch => ({
  changeTab: (newIndex) => dispatch(changeEventPageTabBarIndex(newIndex)),
});

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(TabBar));
