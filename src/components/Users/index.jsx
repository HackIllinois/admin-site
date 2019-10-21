import React from 'react';
import { Column, Table, AutoSizer } from 'react-virtualized';
import 'react-virtualized/styles.css';

import './styles.scss';
import tempData from './temp-data.json';

function tempIncreaseAttendees(attendees) {
  let newAttendees = [];
  for (let i = 0; i < 50; i++) {
    newAttendees = newAttendees.concat(JSON.parse(JSON.stringify(attendees)));
    newAttendees[2 * i].id = 'github' + String(2 * i + 1).padStart(7, '0');
    newAttendees[2 * i + 1].id = 'github' + String(2 * i + 2).padStart(7, '0');
  }
  return newAttendees;
}
const tempRegistrations = tempIncreaseAttendees(tempData.registrations);

function formatCamelCase(camelCase) {
  const [firstWord, ...remainingWords] = camelCase.split(/(?=[A-Z])/);
  const captialFirstWord = firstWord[0].toUpperCase() + firstWord.slice(1);
  return captialFirstWord + ' ' + remainingWords.join(' ');
}

function removeFirstAndLastLine(str) {
  return str.split('\n').map(line => line.trim()).slice(1, -1).join('\n');
}

function formatUserValue(value) {
  if (typeof value == 'string' || typeof value == 'number') {
    return value;
  } else if (Array.isArray(value)) {
    if (value.length === 1) {
      return removeFirstAndLastLine(JSON.stringify(value[0], null, 2))
    }
  }
  return JSON.stringify(value, null, 2);
}

function getRegistrations() {
  return new Promise(resolve => resolve(tempRegistrations));
}

function formatUser(user) {
  const formattedUser = {};
  Object.entries(user).forEach(([key, value]) => {
    formattedUser[key] = formatUserValue(value);
  });
  return formattedUser;
}

export default class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registrations: [],
      selectedColumns: [],
    };
  }

  componentDidMount() {
    getRegistrations().then(registrations => {
      const selectedColumns = registrations.length > 0 ? Object.keys(registrations[0]) : [];
      this.setState({ registrations, selectedColumns });
    });
  }

  getColumns() {
    const { registrations, selectedColumns } = this.state;
    if (registrations.length > 0) {
      // Not using selectedColumns directly because we want to preserve the order given in the registration object
      return Object.keys(registrations[0]).filter(x => selectedColumns.includes(x)).map(key => (
        { label: formatCamelCase(key), key }
      ));
    }
    return [];
  }

  getProcessedRegistrations() {
    const registrationsCopy = this.state.registrations.slice(0);
    return registrationsCopy;
  }

  render() {
    const columns = this.getColumns();
    const registrations = this.getProcessedRegistrations();
    return (
      <div className="users-page">
        <div className="users-table-container">
          <div className="users-table">
            <AutoSizer>
              {({ height, width }) => (
                <Table
                  height={height}
                  width={columns.length * 200}
                  headerHeight={25}
                  rowHeight={50}
                  rowCount={registrations.length}
                  rowGetter={({index}) => formatUser(registrations[index])}
                  headerClassName="table-column-header"
                >
                  {
                    columns.map(({ label, key }) => (
                      <Column label={label} dataKey={key} width={200} key={key} className="table-data"/>
                    ))
                  }
                </Table>
              )}
            </AutoSizer>
          </div>
        </div>
      </div>
    );
  }
}