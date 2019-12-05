import React from 'react';

import './DateInput.scss';

const months = [
  'January', 'February', 'March',
  'April', 'May', 'June',
  'July', 'August', 'September',
  'October', 'November', 'December'
];

export default function DateInput({ values, setFieldValue }) {
  const date = new Date(Number(values.startTime) * 1000);
  const selectedMonth = months[date.getMonth()];

  // the 0th day of a month gets the last day of the previous month, so we add 1 to date.getMonth()
  // to get the last day of selectedMonth
  const numDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const days = Array(numDays).fill(0).map((_, i) => i + 1);
  const selectedDay = date.getDate();

  // we assume that events are only going to be added to a hackathon happening this year or the next
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];
  const selectedYear = date.getFullYear();

  // in case there exists an event not in the current or next year (there shouldn't be), we add that year
  if (!years.includes(selectedYear)) {
    years.push(selectedYear);
  }

  const updateTimes = ({ month = date.getMonth(), day = selectedDay, year = selectedYear }) => {
    const newStartDate = new Date(year, month, day, date.getHours(), date.getMinutes(), date.getSeconds());
    
    const endDate = new Date(Number(values.endTime) * 1000);
    const newEndDate = new Date(year, month, day, endDate.getHours(), endDate.getMinutes(), endDate.getSeconds());

    setFieldValue('startTime', Math.floor(newStartDate.getTime() / 1000));
    setFieldValue('endTime', Math.floor(newEndDate.getTime() / 1000));
  }

  return (
    <div className="date-input">
      <select value={selectedMonth} onChange={e => updateTimes({ month: months.indexOf(e.target.value) })}>
        {
          months.map(month => <option key={month}>{month}</option>)
        }
      </select>
      <select value={selectedDay} onChange={e => updateTimes({ day: Number(e.target.value) })}>
        {
          days.map(day => <option key={day}>{day}</option>)
        }
      </select>
      <select value={selectedYear} onChange={e => updateTimes({ year: Number(e.target.value) })}>
        {
          years.map(year => <option key={year}>{year}</option>)
        }
      </select>
    </div>
  )
}