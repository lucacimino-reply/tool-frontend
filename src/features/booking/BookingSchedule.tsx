import type { BookingDraft } from './booking.types';
import { BookingCalendar } from './BookingCalendar';

interface BookingScheduleProps {
  draft: BookingDraft;
  onDraftChange: (draft: BookingDraft) => void;
  onNext: () => void;
}

export function BookingSchedule({ draft, onDraftChange, onNext }: BookingScheduleProps) {
  const date = draft.schedule?.date;
  if (!date) return null;
  return <section className="booking-stage" aria-labelledby="book-date-heading"><h1 id="book-date-heading">Book Date</h1><p>Book a specific date you need your space sparkled.</p><BookingCalendar selectedDate={date} onSelect={(nextDate) => onDraftChange({ ...draft, schedule: { ...draft.schedule!, date: nextDate } })} /><button className="next-button" type="button" onClick={onNext}>Next</button></section>;
}
