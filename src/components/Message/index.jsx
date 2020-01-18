import React from 'react';
import './style.scss';

export default function Message(props) {
  return (
    <div className="message">
      {props.children}
    </div>
  );
}