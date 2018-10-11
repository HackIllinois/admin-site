import React from 'react';
import { ResponsiveBar } from '@nivo/bar';


class School extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data:[
        {
          university: 'University of Illinois Urbana-Champaign',
          numStudents: 151,
          dogsColor: 'hsl(89, 70%, 50%)',
        },
        {
          university: 'University of Michigan',
          numStudents: 93,
          dogsColor: 'hsl(334, 70%, 50%)',
        },
        {
          university: 'Carl Evan\'s CS 126 Class',
          numStudents: 91,
          dogsColor: 'hsl(334, 70%, 50%)',
        },
        {
          university: 'Purdue',
          numStudents: 51,
          dogsColor: 'hsl(157, 70%, 50%)',
        },
      ]
    }
  }

  test = () => {
    this.setState({
      data:[
        {
          university: 'University of Illinois Urbana-Champaign',
          numStudents: 151,
          dogsColor: 'hsl(89, 70%, 50%)',
        },
        {
          university: 'University of Michigan',
          numStudents: 93,
          dogsColor: 'hsl(89, 70%, 50%)',
        },
      ]
    });
  }

  render() {
    return (
      <div>
        <div style={{height:'250px'}}>
          <ResponsiveBar
            margin={{
              top: 60,
              right: 20,
              bottom: 60,
              left: 20,
            }}
            data={this.state.data}
            indexBy="university"
            keys={['numStudents']}
            padding={0.2}
            labelTextColor="inherit:darker(1.4)"
            labelSkipWidth={16}
            labelSkipHeight={16}
          />
        </div>

        <button onClick={this.test}>Click me</button>
      </div>
    );
  }
}


export default School;