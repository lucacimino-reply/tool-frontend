import { useState } from 'react';

import { addLocalDays, compareLocalDates, dateKey, daysInMonth, localToday, parseDateKey, type LocalCalendarDate } from './local-date';

interface BookingCalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  compact?: boolean;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function BookingCalendar({ selectedDate, onSelect, compact = false }: BookingCalendarProps) {
  const today = localToday();
  const selected = parseDateKey(selectedDate);
  const [visibleMonth, setVisibleMonth] = useState({ year: selected.year, month: selected.month });
  const firstWeekday = new Date(visibleMonth.year, visibleMonth.month, 1).getDay();
  const days = Array.from({ length: daysInMonth(visibleMonth.year, visibleMonth.month) }, (_, index) => index + 1);

  function moveMonth(offset: number) {
    const next = new Date(visibleMonth.year, visibleMonth.month + offset, 1);
    if (compareLocalDates({ year: next.getFullYear(), month: next.getMonth(), day: 1 }, { ...today, day: 1 }) >= 0) {
      setVisibleMonth({ year: next.getFullYear(), month: next.getMonth() });
    }
  }

  if (compact) {
    const start = addLocalDays(selected, -3);
    const dates = Array.from({ length: 7 }, (_, index): LocalCalendarDate => {
      return addLocalDays(start, index);
    });
    return <div className="compact-calendar" aria-label="Schedule date">
      <button type="button" aria-label="Previous week" onClick={() => onSelect(dateKey(addLocalDays(selected, -7)))} disabled={compareLocalDates(addLocalDays(selected, -7), today) < 0}>←</button>
      {dates.map((date) => <button key={dateKey(date)} type="button" className={dateKey(date) === selectedDate ? 'selected' : ''} aria-pressed={dateKey(date) === selectedDate} disabled={compareLocalDates(date, today) < 0} onClick={() => onSelect(dateKey(date))}>{date.day}</button>)}
      <button type="button" aria-label="Next week" onClick={() => onSelect(dateKey(addLocalDays(selected, 7)))}>→</button>
    </div>;
  }

  const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(new Date(visibleMonth.year, visibleMonth.month, 1));
  return <section className="calendar" aria-label="Select a schedule date">
    <div className="calendar-navigation"><button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)} disabled={visibleMonth.year === today.year && visibleMonth.month === today.month}>←</button><strong>{monthLabel}</strong><button type="button" aria-label="Next month" onClick={() => moveMonth(1)}>→</button></div>
    <div className="calendar-grid">{WEEKDAYS.map((weekday) => <span key={weekday}>{weekday.slice(0, 3)}</span>)}{Array.from({ length: firstWeekday }, (_, index) => <i key={`blank-${index}`} />)}{days.map((day) => {
      const date = { ...visibleMonth, day };
      const key = dateKey(date);
      const disabled = compareLocalDates(date, today) < 0;
      return <button key={key} type="button" disabled={disabled} className={key === selectedDate ? 'selected' : ''} aria-pressed={key === selectedDate} onClick={() => onSelect(key)}>{day}</button>;
    })}</div>
  </section>;
}
