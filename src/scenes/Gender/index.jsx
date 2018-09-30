import React from 'react';

import { ResponsiveBar } from '@nivo/bar'

const Gender = () => (
  <ResponsiveBar
    data={[
      {
          gender: 'Male \u2642',
          num: 82
      },
      {
          gender: 'Female \u2640',
          num: 75
      },
      {
          gender: 'Non-Binary',
          num: 20
      }
    ]}
    margin={{
      top: 60,
      right: 60,
      bottom: 40,
      left: 60,
    }}
    axisTop={{
        "orient": "top",
        "legend": "Number of Attendees by Gender",
        "legendPosition": "center",
        "legendOffset":-50
    }}
    indexBy="gender"
    keys={['num']}
    padding={0.5}
    colors="pastel1"
    colorBy="index"
    labelTextColor="#57767b"
    labelSkipWidth={16}
    labelSkipHeight={16}
  />
);

export default Gender;
