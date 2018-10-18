import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import {addSchool} from "../../services/school/actions";

import { connect } from "react-redux";

class School extends React.Component {
  constructor(props) {
    super(props);
    // this.props.dispatch(addSchool("Carl", 100));
    console.log(this.props);
    this.state = {
      data:
      [
        {
          school: 'University of Illinois Urbana-Champaign',
          numStudents: 500,
          dogsColor: 'hsl(89, 70%, 50%)',
        },
        {
          school: 'University of Michigan',
          numStudents: 340,
          dogsColor: 'hsl(334, 70%, 50%)',
        },
        {
          school: 'Purdue',
          numStudents: 230,
          dogsColor: 'hsl(157, 70%, 50%)',
        },
      ]
    }
  }

  updateDate = () => {
    console.log(this.props);
    this.setState({
       data:[// this.props.schools ]
        {
          school: 'University of Illinois Urbana-Champaign',
          numStudents: 500,
          dogsColor: 'hsl(89, 70%, 50%)',
        },
        {
          school: 'University of Michigan',
          numStudents: 340,
          dogsColor: 'hsl(89, 70%, 50%)',
        },
      ]
    });
  };

  updateDate2 = () => {
    console.log(this.props.schools);

    this.props.dispatch(addSchool("Carl", 100));
    this.setState({
      data:[
        {
          school: 'University of Michigan',
          numStudents: 340,
          dogsColor: 'hsl(89, 70%, 50%)',
        },
        {
          school: 'Purdue',
          numStudents: 230,
          dogsColor: 'hsl(157, 70%, 50%)',
        },
      ]
    });
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

            data={this.state.data}

            indexBy="school"
            keys={['numStudents']}
            padding={0.2}
            labelTextColor="inherit:darker(1.4)"
            labelSkipWidth={16}
            labelSkipHeight={16}
          />
        </div>

        <button onClick={this.updateDate}>Click me</button>
        <button onClick={this.updateDate2}>Click me</button>
      </div>
    );
  }
}


export default connect()(School);