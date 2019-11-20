import React from 'react';

import './TimeInput.scss';

// array of possible hours [1, 2, ..., 12]
const hourOptions = Array(12).fill(0).map((_, index) => index + 1);

// array of possible minutes by 5 (padded with zeroes) ['00', '05', '10', ..., '55']
const minuteOptions = Array(12).fill(0)
  .map((_, index) => index * 5)
  .map(minute => String(minute).padStart(2, '0'))

const ampmOptions = ['AM', 'PM'];

function fromEpochTime(epochSeconds) {
  const date = new Date(Number(epochSeconds) * 1000);
  const dateString = date.toLocaleDateString();
  const [time, ampm] = date.toLocaleTimeString().split(' ');
  const [hour, minute] = time.split(':');
  return { dateString, hour, minute, ampm };
}

function toEpochTime(dateString, hour, minute, ampm) {
  const date = new Date(`${dateString} ${hour}:${minute} ${ampm}`);
  return Math.floor(date.getTime() / 1000);
}

export default function TimeInput({ field, form, ...props }) {
  const { dateString, hour, minute, ampm } = fromEpochTime(field.value);

  const updateTime = ({ newHour = hour, newMinute = minute, newAmpm = ampm }) => {
    const epochSeconds = toEpochTime(dateString, newHour, newMinute, newAmpm);
    form.setFieldValue(field.name, epochSeconds);
  }

  return (
    <div className="time-input">
      <span className="label">{props.label}</span>
      <select value={hour} onChange={e => updateTime({ newHour: e.target.value })}>
        {
          hourOptions.map(hour => <option key={hour}>{hour}</option>)
        }
      </select>
      <span className="colon">:</span>
      <select value={minute} onChange={e => updateTime({ newMinute: e.target.value })}>
        {
          minuteOptions.map(minute => <option key={minute}>{minute}</option>)
        }
      </select>

      <select value={ampm} onChange={e => updateTime({ newAmpm: e.target.value })}>
        {
          ampmOptions.map(ampm => <option key={ampm}>{ampm}</option>)
        }
      </select>
    </div>
  )
}