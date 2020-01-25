import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'

import AddFilterPopup from './AddFilterPopup';
import { formatCamelCase } from '../registrations';
import './style.scss';

export default class UserFilters extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopup: false,
    };
  }

  render() {
    const { showPopup } = this.state;

    return (
      <div className="user-filters">
        <div className="filters">
          <div className="add-filter chip" onClick={() => this.setState({ showPopup: true })}>
            <div className="text"><FontAwesomeIcon icon={faPlus}/>&nbsp; Add Filter</div>
          </div>
          {
            this.props.filters.map(({ columnKey, value, multiple, exact }, index) => (
              <div className="chip" key={columnKey + value + multiple + exact}>
                <div className="remove" onClick={() => this.props.onRemoveFilter(index)}>
                  <FontAwesomeIcon icon={faTimes}/>
                </div>
                
                <div className="text">{formatCamelCase(columnKey)}: {value}</div>
              </div>
            ))
          }
        </div>

        {showPopup &&
          <AddFilterPopup
            columnOptions={this.props.columnOptions}
            onAddFilter={filter => this.props.onAddFilter(filter)}
            onClosePopup={() => this.setState({ showPopup: false })}
          />
        }
      </div>
    )
  }
}