import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

import StickyList from 'components/StickyList';
import Checkbox from 'components/Checkbox';
import UserFilters from './UserFilters';
import DecisionButtons from './DecisionButtons';
import Loading from 'components/Loading';
import Message from 'components/Message';
import { StyledSelect } from 'components/SelectField';
import { getRegistrations, getDecisions, getRoles, getRsvps } from 'api';
import { formatCamelCase, filterRegistrations, getColumnKeys, addDecisionAndRsvp, formatRegistrationValue } from './registrations';
import { secondaryColor, secondaryColorLight } from 'constants.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import './style.scss';


const DEFAULT_COLUMN_WIDTH = 150;
const LONG_COLUMN_WIDTH = 300;

export default class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      error: false,
      columnKeys: [], // this array also determines order of the columns
      registrations: [],
      columnOptions: [],
      selectedColumnKeys: [],
      columnWidths: {},
      selectedUserIds: [],
      filters: [], // filters are stored like so [[columnKey1, filterValue1], ...]
    };
  }

  componentDidMount() {
    this.reloadData();
  }

  reloadData() {
    Promise.all([getRegistrations(), getDecisions(), getRsvps()])
      .then(([registrations, decisions, rsvps]) => addDecisionAndRsvp(registrations, decisions, rsvps))
      .then(registrations => {
        if (registrations.length > 0) {
          const columnKeys = getColumnKeys(registrations);

          // Initialize all the column widths to the default
          const columnWidths = {};
          columnKeys.forEach(key => columnWidths[key] = DEFAULT_COLUMN_WIDTH);

          // Go through each registration and if any of the values for a given column is long,
          // then increase that column's width
          const longMinimumLength = 16; // the minimum length of a value for the column to be considered long
          registrations.forEach(registration => {
            Object.entries(registration).forEach(([key, value]) => {
              if (String(value).length > longMinimumLength) {
                columnWidths[key] = LONG_COLUMN_WIDTH;
              }
            });
          });

          this.setState({
            columnKeys,
            registrations,
            columnOptions: this.columnKeysToOptions(columnKeys),
            selectedColumnKeys: columnKeys.slice(0),
            columnWidths,
            isLoading: false,
          });
        }
    }).catch(() => {
      this.setState({ error: true, isLoading: false });
    });
  }
  
  columnKeysToOptions(columnKeys) {
    return columnKeys.map(key => ({ value: key, label: formatCamelCase(key)}))
  }

  addFilter(newFilter) {
    this.setState(prevState => ({
      filters: [newFilter, ...prevState.filters],
      selectedUserIds: [], // we unselect all users (don't want to keep filtered out users still selected)
    }));
  }

  removeFilter(index) {
    this.setState(prevState => ({
      filters: prevState.filters.filter((_, i) => i !== index),
    }));
  }

  // Note: userId can be an array of user ids
  selectUser(userId) {
    // If userId is an array, we want to ensure that the last element of userId is the last element of the
    // new selectedUserIds, so we remove duplicates from the old selectedUserIds rather than from userId
    const equalsUserId = id => Array.isArray(userId) ? userId.includes(id) : id === userId;
    this.setState(prevState => ({
      selectedUserIds: prevState.selectedUserIds.filter(id => !equalsUserId(id)).concat(userId)
    }));
  }

  unselectUser(userId) {
    this.setState(prevState => ({ selectedUserIds: prevState.selectedUserIds.filter(id => id !== userId) }));
  }

  selectAll(registrations = this.state.registrations) {
    this.setState({ selectedUserIds: registrations.map(registration => registration.id)});
  }

  unselectAll() {
    this.setState({ selectedUserIds: [] });
  }

  handleCheckbox(isChecked, event, userId, filteredRegistrations) {
    const { selectedUserIds } = this.state;
    if (isChecked) {
      if (event.shiftKey && selectedUserIds.length >= 1) {
        // If the shift key is pressed, we select every row in between the most recently selected row and the current
        // We assume that the last element of selectedUserIds is most recently select
        const previousId = selectedUserIds[selectedUserIds.length - 1];
        const previousIndex = filteredRegistrations.findIndex(registration => registration.id === previousId);
        const currentIndex = filteredRegistrations.findIndex(registration => registration.id === userId);
        const idsToSelect = filteredRegistrations
          .slice(Math.min(previousIndex, currentIndex), Math.max(previousIndex, currentIndex) + 1)
          .map(registration => registration.id);
        

        // We want the ids ordered so that the current userId is last element
        // in order to make it the most recently selected row if the user shift clicks again
        if (previousIndex > currentIndex) {
          idsToSelect.reverse();
        }

        this.selectUser(idsToSelect.slice(1)); // select everything except previousId (which is at the first index)
      } else {
        this.selectUser(userId);
      }
    } else {
      this.unselectUser(userId);
    }
  }

  updateDecisions() {
    Promise.all([getDecisions(), getRsvps()]).then(([decisions, rsvps]) => {
      this.setState(prevState => (
        { registrations: addDecisionAndRsvp(prevState.registrations, decisions, rsvps) }
      ));
    });
  }

  handleDecision(decisionPromises) {
    Promise.all(decisionPromises).then(() => {
      this.updateDecisions();
      this.unselectAll();
    });
  }

  refresh() {
    this.setState({ isLoading: true, error: false }, () => this.reloadData());
  }

  getTableElementProps(columnKey, elementValue) {
    return {
      className: 'element',
      style: { width: `${this.state.columnWidths[columnKey]}px` },
      key: columnKey,
      title: formatRegistrationValue(elementValue),
    };
  }

  getTableHeader(filteredRegistrations) {
    if (this.state.registrations.length > 0) {
      return (
        <div className="header row">
          <div className="row-number element" />
          <div className="checkbox element">
            <Checkbox
              value={this.state.selectedUserIds.length >= 1}
              onChange={isChecked => isChecked ? this.selectAll(filteredRegistrations) : this.unselectAll()}
              fast
              noHighlight/>
          </div>
          {
            this.state.columnKeys
              .filter(key => this.state.selectedColumnKeys.includes(key))
              .map(key => (
                <div {...this.getTableElementProps(key, formatCamelCase(key))}>{formatCamelCase(key)}</div>
              ))
          }
        </div>
      );
    }
    return <div/>
  }

  getTableRow(row, filteredRegistrations) {
    const registration = filteredRegistrations[row];
    const isRowSelected = this.state.selectedUserIds.includes(registration.id);
    const className = 'row' + (isRowSelected ? ' selected' : '');
    return (
      <div className={className}>
        <div className="row-number element" title={row + 1}>{row + 1}</div>
        <div className="checkbox element">
          <Checkbox
            value={isRowSelected}
            onChange={(isChecked, event) => this.handleCheckbox(isChecked, event, registration.id, filteredRegistrations)}
            fast/>
        </div>
        {
          this.state.columnKeys
            .filter(key => this.state.selectedColumnKeys.includes(key))
            .map(key => (
              <div {...this.getTableElementProps(key, registration[key])}>
                {formatRegistrationValue(registration[key])}
              </div>
            ))
        }
      </div>
    );
  }

  render() {
    const { isLoading, error } = this.state;

    if (isLoading) {
      return <Loading />;
    }

    if (error) {
      return <Message>Error fetching data</Message>;
    }

    const { registrations, filters, selectedColumnKeys, columnOptions, selectedUserIds } = this.state;
    const filteredRegistrations = filterRegistrations(registrations, filters);

    const isAdmin = getRoles().includes('Admin');
    const className = "users-page" + (isAdmin ? ' admin' : '');
    return (
      <div className={className}>
        <div className="table-options">
          <div className="top-row">
            <StyledSelect
              color={secondaryColor}
              colorLight={secondaryColorLight}
              placeholder="Select Which Columns to Display"
              className="column-select"
              isMulti={true}
              options={columnOptions}
              controlShouldRenderValue={false}
              hideSelectedOptions={false}
              closeMenuOnSelect={false}
              value={this.columnKeysToOptions(selectedColumnKeys)}
              onChange={selected => this.setState({ selectedColumnKeys: (selected || []).map(option => option.value) })}/>

            <FontAwesomeIcon className="refresh-icon" icon={faSync} onClick={() => this.refresh()}/>
          </div>
          

          <UserFilters
            filters={filters}
            columnOptions={columnOptions}
            onAddFilter={newFilter => this.addFilter(newFilter)}
            onRemoveFilter={filter => this.removeFilter(filter)}/>

          {isAdmin &&
            <DecisionButtons
              registrations={filteredRegistrations}
              selectedUserIds={selectedUserIds}
              onDecision={decisionPromises => this.handleDecision(decisionPromises)}
              unselectUser={userId => this.unselectUser(userId)}
            />
          }
          
        </div>

        <div className="table-container">
          <AutoSizer>
            {({height, width}) => (
              <StickyList
                height={height}
                width={width}
                itemCount={filteredRegistrations.length}
                itemSize={50}
                stickyRows={[this.getTableHeader(filteredRegistrations)]}>
                  {({index, style}) => (<div style={style}>{this.getTableRow(index, filteredRegistrations)}</div>)}
              </StickyList>
            )}
          </AutoSizer>
        </div>
      </div>
    );
  }
}