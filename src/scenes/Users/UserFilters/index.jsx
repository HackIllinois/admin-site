import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'

import AddFilterPopup from './AddFilterPopup';
import { formatCamelCase } from 'util/registrations';
import './style.scss';

export default class UserFilters extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopup: false,
    };
  }

  formatFilter({ columnKey, value, multiple, exact, invert }) {
    let text = `${formatCamelCase(columnKey)}: `;

    if (multiple) {
      text += value.split(',')
        .map(val => val.trim())
        .map(val => exact ? `"${val}"` : val)
        .map(val => invert ? `!${val}` : val)
        .join(invert ? ' && ' : ' || ');
    } else {
      if (invert) {
        text += '!';
      }
      text += exact ? `"${value}"` : value;
    }

    return text;
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
            this.props.filters.map((filter, index) => (
              <div className="chip" key={JSON.stringify(filter)}>
                <div className="remove" onClick={() => this.props.onRemoveFilter(index)}>
                  <FontAwesomeIcon icon={faTimes}/>
                </div>
                
                <div className="text">{this.formatFilter(filter)}</div>
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