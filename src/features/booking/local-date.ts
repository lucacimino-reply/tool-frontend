export interface LocalCalendarDate {
  year: number;
  month: number;
  day: number;
}

export function localToday(now = new Date()): LocalCalendarDate {
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
}

export function dateKey({ year, month, day }: LocalCalendarDate): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseDateKey(value: string): LocalCalendarDate {
  const [year, month, day] = value.split('-').map(Number);
  return { year, month: month - 1, day };
}

export function compareLocalDates(left: LocalCalendarDate, right: LocalCalendarDate): number {
  return dateKey(left).localeCompare(dateKey(right));
}

export function formatLocalDate(value: string, options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'long', day: 'numeric' }): string {
  const date = parseDateKey(value);
  return new Intl.DateTimeFormat(undefined, options).format(new Date(date.year, date.month, date.day));
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
