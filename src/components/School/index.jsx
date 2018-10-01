import React from 'react';

import { ResponsiveBar } from '@nivo/bar';

const School = () => (
    <ResponsiveBar
        margin={{
        top: 60,
        right: 20,
        bottom: 60,
        left: 20,
        }}
        data={[
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
            university: 'Purdue',
            numStudents: 51,
            dogsColor: 'hsl(157, 70%, 50%)',
        },
        ]}
        indexBy="university"
        keys={['numStudents']}
        padding={0.2}
        labelTextColor="inherit:darker(1.4)"
        labelSkipWidth={16}
        labelSkipHeight={16}
    />
);

export default School;
