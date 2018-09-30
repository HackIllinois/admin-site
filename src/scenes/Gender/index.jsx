import React from 'react';

import { ResponsiveBar } from '@nivo/bar'

const Gender = () => (
  <ResponsiveBar
    data={[
      {
          "gender": 'Male \u2642',
          "num": 82,
          "grad2019": 25,
          "grad2020": 27,
          "grad2021": 15,
          "grad2022": 15
      },
      {
          "gender": 'Female \u2640',
          "num": 75,
          "grad2019": 17,
          "grad2020": 23,
          "grad2021": 20,
          "grad2022": 15
      },
      {
          "gender": 'Non-Binary',
          "num": 20,
          "grad2019": 5,
          "grad2020": 7,
          "grad2021": 6,
          "grad2022": 2
      }
    ]}
    defs={[
      {
        id: 'grad',
        type: 'linearGradient',
        colors: [
          { offset: 0, color: '#f7ecc8' },
          { offset: 100, color: '#edd074' },
        ],
      }
    ]}
    fill={[
      {
        "match": {
            "id": "grad2020"
        },
        "id": "grad"
      },
      {
        "match": {
            "id": "grad2022"
        },
        "id": "grad"
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
    keys={["grad2019", "grad2020", "grad2021", "grad2022"]}
    padding={0.5}
    colors="pastel1"
    colorBy="index"
    labelTextColor="#57767b"
    labelSkipWidth={16}
    labelSkipHeight={13}
  />
);

export default Gender;
