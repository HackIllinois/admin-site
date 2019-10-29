import React from 'react';
import MUIDataTable from 'mui-datatables';

import './styles.scss';
import { formatCamelCase, getRegistrations } from './users';

const filterableColumns = ['school', 'graduationYear', 'major', 'isNovice', 'isPrivate'];
const sortableColumns = ['id', 'firstName', 'lastName', 'age', 'graduationYear', 'school'];

const tableOptions = {
  filterType: 'checkbox',
  print: false,
  download: false,
  selectableRowsOnClick: true,
  responsive: 'scrollMaxHeight',
  textLabels: {
    body: {
      noMatch: "Loading...",
    }
  },
}

export default class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registrations: [],
    }
  }

  componentDidMount() {
    getRegistrations().then(registrations => this.setState({ registrations }))
  }

  getColumns() {
    const { registrations } = this.state;
    
    if (registrations.length > 0) {
      return Object.keys(registrations[0]).map(key => ({
        name: key,
        label: formatCamelCase(key),
        options: {
          filter: filterableColumns.includes(key),
          sort: sortableColumns.includes(key),
        },
      }));
    }
    return [];
  }

  render() {
    return (
      <div className="users-page">
        <div className="users-table">
          <MUIDataTable
            title="Users"
            data={ this.state.registrations }
            columns={ this.getColumns() }
            options={ tableOptions }
          />
        </div>
      </div>
    )
  }
}