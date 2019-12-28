import React from 'react';

import './TimeInput.scss';
import { StyledSelect } from 'components/SelectField';

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

      <StyledSelect
        className="hour select"
        options={hourOptions.map(hour => ({ value: hour, label: hour }))}
        value={{ value: hour, label: hour }}
        onChange={selected => updateTime({ newHour: selected.value })}
      />

      <span className="colon">:</span>

      <StyledSelect
        className="minute select"
        options={minuteOptions.map(minute => ({ value: minute, label: minute }))}
        value={{ value: minute, label: minute }}
        onChange={selected => updateTime({ newMinute: selected.value })}
      />

      <StyledSelect
        className="ampm select"
        options={ampmOptions.map(ampm => ({ value: ampm, label: ampm }))}
        value={{ value: ampm, label: ampm }}
        onChange={selected => updateTime({ newAmpm: selected.value })}
      />
    </div>
  )
}