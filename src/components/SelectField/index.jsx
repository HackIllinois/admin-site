import React from 'react';
import Select from 'react-select';
import { Field } from 'formik';

import COLORS from 'constants.scss';

const StyledSelect = props => {
  const { primaryColor, primaryColorLight } = COLORS;
  const { color = primaryColor, colorLight = primaryColorLight } = props;
  const theme = defaultTheme => ({
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: color,
      primary25: colorLight,
      primary50: colorLight
    }
  });

  return <Select theme={theme} {...props}/>;
}

class FormikSelect extends React.Component {
  getValue = () => {
    const { field, isMulti, options } = this.props;

    if (isMulti) {
      if (field.value === undefined || field.value === null) {
        return [];
      }
      return options.filter(option => field.value.includes(option.value));
    }

    if (field.value === undefined || field.value === null || field.value === '') {
      return '';
    }
    return options.find(option => field.value === option.value);
  }

  handleChange = selected => {
    const { field, form, isMulti } = this.props;

    if (isMulti) {
      const values = selected ? selected.map(opt => opt.value) : [];
      form.setFieldValue(field.name, values);
    } else {
      const value = selected ? selected.value : '';
      form.setFieldValue(field.name, value);
    }
  }

  render() {
    const { field } = this.props;
    return (
      <StyledSelect
        name={field.name}
        onChange={this.handleChange}
        value={this.getValue()}
        {...this.props}
      />
    );
  }
}

const SelectField = ({ name, ...props }) => (
  <Field key={name} name={name} component={FormikSelect} {...props} />
);

export default SelectField;
export { StyledSelect };