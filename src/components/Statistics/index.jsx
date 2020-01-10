import React from 'react';
import Chart from "react-frappe-charts";

import './style.scss';
import { primaryColor } from 'constants.scss';
import { getStats } from 'api';
import Loading from 'components/Loading';

const decisionStatuses = ['ACCEPTED', 'PENDING', 'REJECTED', 'WAITLISTED'];
const decisionFinalized = ['true', 'false'];
const genders = ['', 'FEMALE', 'MALE', 'NONBINARY'];
const graduationYears = ['2020', '2021', '2022', '2023'];
const majors = ['CS', 'CE', 'EE', 'ENG', 'BUS', 'LAS', 'OTHER'];

// If a category has a count of 0, it's excluded from the api data, so we add it back
function generateCompleteData(allOptions, data) {
  const completeData = {};
  allOptions.forEach(option => {
    completeData[option] = data[option] || 0;
  });
  return completeData;
}

function calculatePercentage(value, data) {
  const total = Object.values(data).reduce((total, current) => total + current, 0);
  return `${(value / total * 100).toFixed(2)}%`;
}

export default class Statistics extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      stats: {},
    }
  }

  componentDidMount() {
    getStats().then(stats => {
      this.setState({ stats, isLoading: false }, () => {
        // causes charts to re render after delay (sometimes the charts are incorrectly sized for some reason)
        setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
      });
    });
  }

  render() {
    const { stats, isLoading } = this.state;

    if (isLoading) {
      return <Loading />;
    }

    const counts = {
      'Applicants': stats.registration.attendees.count,
      'RSVPs': stats.rsvp.count,
      'Checked In': stats.checkin.count,
      'Mentors': stats.registration.mentors.count,
    };

    const graphs = [
      {
        title: 'Decision',
        data: generateCompleteData(decisionStatuses, stats.decision.status),
      },
      {
        title: 'Decision Finalized',
        data: generateCompleteData(decisionFinalized, stats.decision.finalized),
      },
      {
        title: 'Gender',
        data: generateCompleteData(genders, stats.registration.attendees.gender),
      },
      {
        title: 'Graduation Year',
        data: generateCompleteData(graduationYears, stats.registration.attendees.graduationYear)
      },
      {
        title: 'Major',
        data: generateCompleteData(majors, stats.registration.attendees.major)
      }
    ]

    return (
      <div className="statistics-page">
        <div className="container">
          <div className="counts box">
            <div className="title">Counts</div>
            {Object.entries(counts).map(([text, count]) => (
              <React.Fragment key={text}>
                <div className="text">{text}</div>
                <div className="count">{count}</div>
                <div className="separator"/>
              </React.Fragment>
            ))}
          </div>

          {graphs.map(graph => (
            <div className="graph box" key={graph.title}>
              <div className="title">{graph.title}</div>
              <Chart
                type="bar"
                colors={[primaryColor]}
                height={250}
                data={{
                  labels: Object.keys(graph.data),
                  datasets: [{ name: 'Applicants', values: Object.values(graph.data) }],
                }}
                tooltipOptions={{
                  formatTooltipY: value => `${value} (${calculatePercentage(value, graph.data)})`
                }}
              />
            </div>
          ))}

          {/* Just displaying the counts rather than bar chart due to potentially huge number of schools */}
          <div className="counts box">
            <div className="title">School</div>
            {Object.entries(stats.registration.attendees.school)
              .sort(([text1, count1], [text2, count2]) => count2 - count1) // sort by count, greatest to least
              .map(([text, count]) => (
                <React.Fragment key={text}>
                  <div className="text">{text}</div>
                  <div className="count">{count}</div>
                  <div className="separator"/>
                </React.Fragment>
              )
            )}
          </div>
        </div>
      </div>
    )
  }
}