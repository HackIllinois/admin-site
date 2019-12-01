import React from 'react';
import Clusterize from 'react-clusterize';
import Select from 'react-select';

import './styles.scss';

function formatCamelCase(camelCase) {
  const [firstWord, ...remainingWords] = camelCase.split(/(?=[A-Z])/);
  const captialFirstWord = firstWord[0].toUpperCase() + firstWord.slice(1);
  return captialFirstWord + ' ' + remainingWords.join(' ');
}

function formatUser(user) {
  const formattedUser = {};
  Object.entries(user).forEach(([key, value]) => {
    formattedUser[key] = formatUserValue(value);
  });
  return formattedUser;
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

function removeFirstAndLastLine(str) {
  return str.split('\n').map(line => line.trim()).slice(1, -1).join('\n');
}

// the registrations data is huge so we don't want to refetch it every time 
let savedRegistrations = [];
async function getRegistrations(forceRefresh = false) {
  if (savedRegistrations.length > 0 && !forceRefresh) {
    return savedRegistrations;
  }
  const response = await fetch('https://hackillinois-mock-api.netlify.com/registrations.json');
  const registrations = await response.json();
  const formattedRegistrations = registrations.map(formatUser);
  savedRegistrations = formattedRegistrations;
  return formattedRegistrations;
}

export default class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registrations: [],
      longColumnKeys: new Set(),
      columnOptions: [],
      excludedColumns: [],
    };
  }

  componentDidMount() {
    getRegistrations().then(registrations => {
      if (registrations.length > 0) {
        const longMinimumLength = 16; // the minumum length of a value for the column to be considered long
        const longColumnKeys = new Set();
        registrations.forEach(registration => {
          Object.entries(registration).forEach(([key, value]) => {
            if (String(value).length > longMinimumLength) {
              longColumnKeys.add(key);
            }
          })
        });

        const columnOptions = Object.keys(registrations[0]).map(key => (
          { value: key, label: formatCamelCase(key) }
        ));

        this.setState({ registrations, longColumnKeys, columnOptions });
      }
    });
  }

  getElementClass(columnKey) {
    let className = 'element';
    if (this.state.longColumnKeys.has(columnKey)) {
      className += ' long';
    }
    return className;
  }

  getTableHeader() {
    if (this.state.registrations.length > 0) {
      return (
        <div className="header row">
          {
            Object.keys(this.state.registrations[0])
              .filter(key => !this.state.excludedColumns.includes(key))
              .map(key => (
                <div className={this.getElementClass(key)} key={key}>{formatCamelCase(key)}</div>
              ))
          }
        </div>
      );
    }
    return <div/>
  }

  getTableRows() {
    return [this.getTableHeader()].concat(this.state.registrations.map(registration => (
      <div className="row">
        {
          Object.entries(registration)
            .filter(([key]) => !this.state.excludedColumns.includes(key))
            .map(([key, value]) => (
              <div className={this.getElementClass(key)} key={key}>{value}</div>
            ))
        }
      </div>
    )))
  }

  render() {
    return (
      <div className="users-page">
        <div className="table-options">
          <Select
            placeholder="Columns to Exclude"
            className="column-select"
            isMulti={true}
            options={this.state.columnOptions}
            onChange={selected => this.setState({ excludedColumns: (selected || []).map(column => column.value) })}/>
        </div>
        <div className="table-container">
          <Clusterize className="table" rows={this.getTableRows()}/>
        </div>
      </div>
    );
  }
}