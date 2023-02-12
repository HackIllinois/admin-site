import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import './style.scss';

export default function Checkbox({ value, onChange, label, fast, noHighlight, ...props }) {
  const checkboxClass = 'checkbox' + (value ? ' checked' : ''); 
  const handleKeyPress = event => {
    if (event.which === 13) { // enter key
      onChange(!value, event);
    }
  }

  const clickListenerType = fast ? 'onMouseDown' : 'onClick';
  const clickListener = {
    [clickListenerType]: event => onChange(!value, event)
  };

  return (
    <div className="checkbox-container" {...clickListener} {...props}>
      <div className={checkboxClass} onKeyPress={handleKeyPress} tabIndex="0">
        <FontAwesomeIcon className="check" icon={faCheck}/>
        {!noHighlight && <div className="highlight"/>}
      </div>

      <div className="label">{ label }</div>
    </div>
  )
}

const FormikCheckbox = ({field, form, ...props}) => {
  const updateValue = newValue => form.setFieldValue(field.name, newValue);
  return <Checkbox value={field.value} onChange={updateValue} {...props} />
}

export {FormikCheckbox};
