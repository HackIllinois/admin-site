import React from 'react';
import Select from 'react-select';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import Checkbox from 'components/Checkbox';
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

const DEFAULT_COLUMN_WIDTH = 150;
const LONG_COLUMN_WIDTH = 300;

export default class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registrations: [],
      columnOptions: [],
      selectedColumnKeys: [],
      columnWidths: {},
      selectedUserIds: [],
    };
  }

  componentDidMount() {
    getRegistrations().then(registrations => {
      if (registrations.length > 0) {
        // Initialize all the column widths to the default
        const columnWidths = {};
        Object.keys(registrations[0]).forEach(key => {
          columnWidths[key] = DEFAULT_COLUMN_WIDTH;
        });

        // Go through each registration and if any of the values for a given column is long,
        // then increase that column's width
        const longMinimumLength = 16; // the minumum length of a value for the column to be considered long
        registrations.forEach(registration => {
          Object.entries(registration).forEach(([key, value]) => {
            if (String(value).length > longMinimumLength) {
              columnWidths[key] = LONG_COLUMN_WIDTH;
            }
          })
        });

        const columnOptions = this.columnKeysToOptions(Object.keys(registrations[0]));

        const selectedColumnKeys = Object.keys(registrations[0]);

        this.setState({ registrations, columnOptions, selectedColumnKeys, columnWidths });
      }
    });
  }

  columnKeysToOptions(columnKeys) {
    return columnKeys.map(key => ({ value: key, label: formatCamelCase(key)}))
  }

  selectUser(userId, select = true) {
    this.setState(prevState => {
      if (select) {
        return { selectedUserIds: prevState.selectedUserIds.concat(userId)}
      } else {
        return { selectedUserIds: prevState.selectedUserIds.filter(id => id !== userId) }
      }
    });
  }

  getTableElementProps(columnKey, elementValue) {
    return {
      className: 'element',
      style: { width: `${this.state.columnWidths[columnKey]}px` },
      key: columnKey,
      title: elementValue,
    };
  }

  getRowWidth() {
    return Object.values(this.state.columnWidths).reduce((total, value) => total + value, 0);
  }

  getTableHeader() {
    if (this.state.registrations.length > 0) {
      return (
        <div className="header row">
          <div className="checkbox element"/>
          {
            Object.keys(this.state.registrations[0])
              .filter(key => this.state.selectedColumnKeys.includes(key))
              .map(key => (
                <div {...this.getTableElementProps(key)}>{formatCamelCase(key)}</div>
              ))
          }
        </div>
      );
    }
    return <div/>
  }

  getTableRow(row) {
    if (row === 0) {
      return this.getTableHeader();
    } else {
      const registration = this.state.registrations[row - 1];
      const isRowSelected = this.state.selectedUserIds.includes(registration.id);
      const className = 'row' + (isRowSelected ? ' selected' : '');
      return (
        <div className={className}>
          <div className="checkbox element">
            <Checkbox
              value={isRowSelected}
              onChange={value => this.selectUser(registration.id, value)}
              fast/>
          </div>
          {
            Object.entries(registration)
              .filter(([key]) => this.state.selectedColumnKeys.includes(key))
              .map(([key, value]) => (
                <div {...this.getTableElementProps(key, value)}>{value}</div>
              ))
          }
        </div>
      )
    }
  }

  render() {
    return (
      <div className="users-page">
        <div className="table-options">
          <Select
            placeholder="Columns to Display"
            className="column-select"
            isMulti={true}
            options={this.state.columnOptions}
            value={this.columnKeysToOptions(this.state.selectedColumnKeys)}
            onChange={selected => this.setState({ selectedColumnKeys: (selected || []).map(option => option.value) })}/>
        </div>

        <div className="table-container">
          <AutoSizer>
            {({height, width}) => (
              <List
                height={height}
                width={width}
                itemCount={this.state.registrations.length + 1}
                itemSize={50}>
                  {({index, style}) => (<div style={style}>{this.getTableRow(index)}</div>)}
              </List>
            )}
          </AutoSizer>
        </div>
      </div>
    );
  }
}