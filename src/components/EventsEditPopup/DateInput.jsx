import React from 'react';

import './DateInput.scss';
import { StyledSelect } from 'components/SelectField';

const months = [
  'January', 'February', 'March',
  'April', 'May', 'June',
  'July', 'August', 'September',
  'October', 'November', 'December'
];

export default function DateInput({ values, setFieldValue }) {
  const date = new Date(Number(values.startTime) * 1000);
  const selectedMonth = date.getMonth();
  const selectedDay = date.getDate();
  const selectedYear = date.getFullYear();

  // the 0th day of a month gets the last day of the previous month, so we add 1 to date.getMonth()
  // to get the last day of selectedMonth
  const numDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const days = Array(numDays).fill(0).map((_, i) => i + 1);

  // we assume that events are only going to be added to a hackathon happening this year or the next
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];

  // in case there exists an event not in the current or next year (there shouldn't be), we add that year
  if (!years.includes(selectedYear)) {
    years.push(selectedYear);
  }

  const updateTimes = ({ month = selectedMonth, day = selectedDay, year = selectedYear }) => {
    const newStartDate = new Date(year, month, day, date.getHours(), date.getMinutes(), date.getSeconds());
    
    const endDate = new Date(Number(values.endTime) * 1000);
    const newEndDate = new Date(year, month, day, endDate.getHours(), endDate.getMinutes(), endDate.getSeconds());

    setFieldValue('startTime', Math.floor(newStartDate.getTime() / 1000));
    setFieldValue('endTime', Math.floor(newEndDate.getTime() / 1000));
  }

  return (
    <div className="date-input">
      <StyledSelect
        className="month select"
        options={months.map(month => ({ value: month, label: month }))}
        value={{ value: selectedMonth, label: months[selectedMonth] }}
        onChange={selected => updateTimes({ month: months.indexOf(selected.value) })}
      />

      <StyledSelect
        className="day select"
        options={days.map(day => ({ value: day, label: day }))}
        value={{ value: selectedDay, label: selectedDay}}
        onChange={selected => updateTimes({ day: selected.value})}
      />

      <StyledSelect
        className="year select"
        options={years.map(year => ({ value: year, label: year }))}
        value={{ value: selectedYear, label: selectedYear}}
        onChange={selected => updateTimes({ year: selected.value })}
      />
    </div>
  )
}