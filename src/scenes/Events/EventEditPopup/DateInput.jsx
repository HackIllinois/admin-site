import React from 'react';
import DatePicker from 'react-datepicker';

import './DateInput.scss';
import "react-datepicker/dist/react-datepicker.css";

export default function TimeInput({ field, form, ...props }) {
  const date = new Date(Number(field.value) * 1000);

  const handleDateSelect = date => {
    form.setFieldValue(field.name, Math.floor(date.getTime() / 1000));
  }

  return (
    <div className="date-input">
      <span className="label">{props.label}</span>
      <DatePicker
        className="date-picker"
        selected={date}
        onChange={handleDateSelect}
        showTimeSelect
        timeIntervals={15}
        dateFormat="MMM dd, yyyy 'at' h:mm aa"/>
    </div>
  )
}