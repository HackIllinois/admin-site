import React from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';

import { openEventEditor } from 'services/ui/actions';

const EventHeader = ({ openEventEditor }) => (
  <div>
    <Button 
      onClick={() => openEventEditor()}
      variant="contained"
      color="primary"
    >Create event</Button>
  </div>
);
// class EventHeader extends React.Component {
//   componentWillMount() {
//     console.log('FRANKKKK');
//   }
//   render() {
//     return (
//     <div>
//       <Button 
//         onClick={() => openEventEditor()}
//         variant="contained"
//         color="primary"
//       >Create event</Button>
//     </div>
//     )
//   }
// }

const mapDispatchToProps = (dispatch) => ({
  openEventEditor: () => dispatch(openEventEditor()),
});

export default connect(null, mapDispatchToProps)(EventHeader);
