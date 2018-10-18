import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { addSchool } from "./actions";

import { connect } from "react-redux";

let counter = 0;

class School extends React.Component {
  constructor(props) {
    super(props);
    this.props.dispatch(addSchool("" + counter++, 100));
  }

  updateDate = () => {
    this.props.dispatch(addSchool("" + counter++, 100));
  };

  render() {
    return (
      <div>
        <div style={{height:'265px'}}>
          <ResponsiveBar
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 30,
            }}

            // data={this.state.data}
            data={this.props.schools.school}

            indexBy="name"
            keys={['numStudents']}
            padding={0.2}
            labelTextColor="inherit:darker(1.4)"
            labelSkipWidth={16}
            labelSkipHeight={16}
          />
        </div>

        <button onClick={this.updateDate}>Click me</button>
      </div>
    );
  }
}


export default connect()(School);