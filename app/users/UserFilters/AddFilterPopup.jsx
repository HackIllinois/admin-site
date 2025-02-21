import React from 'react'

import Checkbox from 'components/Checkbox'
import { StyledSelect } from 'components/SelectField/SelectField'

export default class AddFilterPopup extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            columnKey: '',
            value: '',
            multiple: false,
            exact: false,
            invert: false,
        }
    }

    addFilter() {
        const { columnKey, value, multiple, exact, invert } = this.state
        if (columnKey) {
            this.props.onAddFilter({
                columnKey,
                value,
                multiple,
                exact,
                invert,
            })
            this.props.onClosePopup()
        }
    }

    render() {
        const { value, multiple, exact, invert } = this.state

        return (
            <div
                className="add-filter-popup"
                onClick={() => this.props.onClosePopup()}
            >
                <div className="content" onClick={(e) => e.stopPropagation()}>
                    <h2 className="title">Add Filter</h2>

                    <StyledSelect
                        placeholder="Select a Column"
                        options={this.props.columnOptions}
                        onChange={(option) =>
                            this.setState({ columnKey: option.value })
                        }
                    />

                    <input
                        className="filter-input"
                        placeholder="Filter Value"
                        value={value}
                        onChange={(e) =>
                            this.setState({ value: e.target.value })
                        }
                        onKeyPress={(e) => e.which === 13 && this.addFilter()}
                    />

                    <Checkbox
                        value={multiple}
                        onChange={(newValue) =>
                            this.setState({ multiple: newValue })
                        }
                        label="Multiple"
                        title="Enter comma separated values (row will be displayed if any of those match)"
                    />

                    <br />

                    <Checkbox
                        value={exact}
                        onChange={(newValue) =>
                            this.setState({ exact: newValue })
                        }
                        label="Exact"
                        title="Value in column must match exactly (still case-insensitive though)"
                    />

                    <br />

                    <Checkbox
                        value={invert}
                        onChange={(newValue) =>
                            this.setState({ invert: newValue })
                        }
                        label="Invert"
                        title="Display all rows that do NOT contain Filter Value"
                    />

                    <div className="buttons">
                        <button
                            className="cancel button"
                            onClick={() => this.props.onClosePopup()}
                        >
                            Cancel
                        </button>
                        <div className="spacer" />
                        <button
                            className="add button"
                            onClick={() => this.addFilter()}
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}
