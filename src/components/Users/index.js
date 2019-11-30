import React from 'react';
import Clusterize from 'react-clusterize';

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
      registrations: []
    };
  }

  componentDidMount() {
    getRegistrations().then(registrations => this.setState({ registrations }));
  }

  getTableHeader() {
    if (this.state.registrations.length > 0) {
      return (
        <div className="header row">
          {
            Object.keys(this.state.registrations[0]).map(key => (
              <div className="element">{formatCamelCase(key)}</div>
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
          Object.values(registration).map(value => (
            <div className="element">{value}</div>
          ))
        }
      </div>
    )))
  }

  render() {
    return (
      <div className="users-page">
        <Clusterize className="table" rows={this.getTableRows()}/>
      </div>
    );
  }
}