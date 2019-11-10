import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import './styles.scss';

export default function Checkbox(props) {
  const checkboxClass = 'checkbox' + (props.value ? ' checked' : ''); 
  return (  
    <div className="checkbox-container" onClick={() => props.onChange(!props.value)}>
      <div className={ checkboxClass }>
        <FontAwesomeIcon className="check" icon={faCheck}/>
      </div>

      <div className="label">{ props.label }</div>
    </div>
  )
}