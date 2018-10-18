import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { addSchool } from "./actions";

import { connect } from "react-redux";

let counter = 0;

class School extends React.Component {
  constructor(props) {
    super(props);
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
    this.props.dispatch(addSchool("" + counter, 100));
    counter++;
    var arr = [];
    this.props.schools.school.forEach(function(element) {
      arr.push({
        school: element.name,
        numStudents: element.numStudents
      });
    });



    this.setState({
      data: arr
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