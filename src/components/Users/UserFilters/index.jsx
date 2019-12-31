import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'

import { StyledSelect } from 'components/SelectField';
import { formatCamelCase } from '../registrations';
import './styles.scss';

export default class UserFilters extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopup: false,
      addColumn: '',
      addValue: '',
    };
  }
  
  addFilter() {
    const { addColumn, addValue } = this.state;
    if (addColumn && addValue) {
      this.props.onAddFilter([addColumn, addValue]);
      this.setState({ showPopup: false, addColumn: '', addValue: ''});
    }
  }

  removeFilter(filter) {
    this.props.onRemoveFilter(filter);
  }

  render() {
    return (
      <div className="user-filters">
        <div className="filters">
          <div className="add-filter chip" onClick={() => this.setState({ showPopup: true })}>
            <div className="text"><FontAwesomeIcon icon={faPlus}/>&nbsp; Add Filter</div>
          </div>
          {
            this.props.filters.map(([columnKey, filterValue]) => (
              <div className="chip" key={columnKey + filterValue}>
                <div className="remove" onClick={() => this.removeFilter([columnKey, filterValue])}>
                  <FontAwesomeIcon icon={faTimes}/>
                </div>
                
                <div className="text">{formatCamelCase(columnKey)}: {filterValue}</div>
              </div>
            ))
          }
        </div>

        {this.state.showPopup &&
          <div className="add-filter-popup" onClick={() => this.setState({showPopup: false})}>
            <div className="content" onClick={e => e.stopPropagation()}>
              <h2 className="title">Add Filter</h2>

              <StyledSelect
                placeholder="Select a Column"
                options={this.props.columnOptions}
                onChange={option => this.setState({addColumn: option.value})}/>

              <input
                className="filter-input"
                placeholder="Filter Value"
                onChange={e => this.setState({ addValue: e.target.value })}
                onKeyPress={e => e.which === 13 && this.addFilter()}/>

              <div className="buttons">
                <button className="cancel button" onClick={() => this.setState({showPopup: false})}>Cancel</button>
                <div className="spacer"/>
                <button className="add button" onClick={() => this.addFilter()}>Add</button>
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
}