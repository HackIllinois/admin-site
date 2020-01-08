import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import './styles.scss';

export default function Checkbox(props) {
  const checkboxClass = 'checkbox' + (props.value ? ' checked' : ''); 
  const handleKeyPress = event => {
    if (event.which === 13) { // enter key
      props.onChange(!props.value, event);
    }
  }

  const clickListenerType = props.fast ? 'onMouseDown' : 'onClick';
  const clickListener = {
    [clickListenerType]: event => props.onChange(!props.value, event)
  };

  return (
    <div className="checkbox-container" {...clickListener}>
      <div className={checkboxClass} onKeyPress={handleKeyPress} tabIndex="0">
        <FontAwesomeIcon className="check" icon={faCheck}/>
        {!props.noHighlight && <div className="highlight"/>}
      </div>

      <div className="label">{ props.label }</div>
    </div>
  )
}