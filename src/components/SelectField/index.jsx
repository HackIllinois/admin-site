import React from 'react';
import Select from 'react-select';

import { primaryColor, primaryColorLight } from 'constants.scss';

export default function SelectField(props) {
  const color = props.color || primaryColor;
  const colorLight = props.colorLight || primaryColorLight;
  const theme = defaultTheme => ({
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: color,
      primary25: colorLight,
      primary50: colorLight
    }
  });

  const propsCopy = Object.assign({}, props);
  delete propsCopy.color;
  delete propsCopy.colorLight;

  return <Select theme={theme} {...propsCopy}/>
}