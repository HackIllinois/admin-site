import React from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import { withTheme } from '@material-ui/core/styles';

import { openEventEditor } from 'services/ui/actions';

const EventHeader = ({ openEventEditor, theme }) => (
  <div>
    <Button 
      onClick={() => openEventEditor()}
      variant="contained"
      color="secondary"
    >Create event</Button>
  </div>
);

const mapDispatchToProps = (dispatch) => ({
  openEventEditor: () => dispatch(openEventEditor()),
});

export default withTheme()(connect(null, mapDispatchToProps)(EventHeader));
