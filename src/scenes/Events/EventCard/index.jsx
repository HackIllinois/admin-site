import React from 'react';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faKey, faLock } from '@fortawesome/free-solid-svg-icons';

import FormPopup from 'components/FormPopup';
import EventCodeForm from '../EventCodeForm';
import './style.scss';

const EventCard = ({ event, canEdit, onClick, isAddButton, reloadEvents }) => {
  const urlRegex = /https?:\/\/((www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*))/g;
  const processDescription = description => description.replace(urlRegex, '<a href="$&" onclick="event.stopPropagation()" target="_blank" rel="noopener noreferrer">$1</a>');

  const formatTime = seconds => new Date(seconds * 1000)
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });

  const calculateDayDifference = event => {
    const startDay = new Date(event.startTime * 1000);
    const endDay = new Date(event.endTime * 1000);
    startDay.setHours(0, 0, 0, 0);
    endDay.setHours(0, 0, 0, 0);

    const difference = Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
    const prefix = (difference < 0) ? '-' : '+';
    if (difference !== 0) {
      return prefix + Math.abs(difference);
    }
    return '';
  };

  if (isAddButton) {
    return (
      <div className="event-card-container">
        <button className={clsx('event-card', 'add-button', 'clickable')} onClick={onClick}>
          <FontAwesomeIcon className="add-event-icon" icon={faPlus} />
        </button>
      </div>
    );
  }

  return (
    <div className="event-card-container">
      <button
        className={clsx('event-card', canEdit && 'clickable')}
        onClick={e => canEdit && onClick(e)}
      >
        <div className="event-header">
          <div className="event-name">
            {event.isPrivate && <FontAwesomeIcon className='private-icon' icon={faLock} size="xs" />}
            {event.name}
          </div>
          <div className="event-time">
            <div className="start">{formatTime(event.startTime)}</div>
            <div className="end">
              {formatTime(event.endTime)}
              <span className="day-difference">{calculateDayDifference(event)}</span>
            </div>
          </div>
        </div>

        <div className="event-details">
          <div className="description" dangerouslySetInnerHTML={{ __html: processDescription(event.description) }} />

          <div className="locations">
            {(event.locations || []).map(location => location.description).map(x => x.trim()).join(', ')}
          </div>

          <div className="event-type">
            {event.eventType}
          </div>
        </div>
      </button>

      <FormPopup form={EventCodeForm} onSubmit={reloadEvents} event={event}>
        <button className="event-code-button">
          <FontAwesomeIcon icon={faKey} fixedWidth />
        </button>
      </FormPopup>
    </div>
  )
};

export default EventCard;
