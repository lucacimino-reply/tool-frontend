import { FIXED_ARRIVAL_TIMES, type BookingDraft, type FixedArrivalTime } from './booking.types';
import { BookingCalendar } from './BookingCalendar';

interface BookingTimingProps {
  draft: BookingDraft;
  onDraftChange: (draft: BookingDraft) => void;
  onNext: () => void;
}

export function BookingTiming({ draft, onDraftChange, onNext }: BookingTimingProps) {
  const date = draft.schedule?.date;
  if (!date) return null;
  return <section className="booking-stage timing" aria-labelledby="book-timing-heading"><h1 id="book-timing-heading">Book Timing</h1><p>Save even more by booking flexible times.</p><BookingCalendar compact selectedDate={date} onSelect={(nextDate) => onDraftChange({ ...draft, schedule: { ...draft.schedule!, date: nextDate } })} />
    <button type="button" className={`arrival-option flexible ${draft.arrival.type === 'flexible' ? 'selected' : ''}`} aria-pressed={draft.arrival.type === 'flexible'} onClick={() => onDraftChange({ ...draft, arrival: { type: 'flexible' } })}><strong>Flexible</strong><span>Cleaner will arrive between 09:00am-04:00pm</span><b>Save $8.10 off</b></button>
    <div className="fixed-arrivals" aria-label="Fixed arrival times">{FIXED_ARRIVAL_TIMES.map((time) => <button key={time} type="button" className={draft.arrival.type === 'fixed' && draft.arrival.time === time ? 'selected' : ''} aria-pressed={draft.arrival.type === 'fixed' && draft.arrival.time === time} onClick={() => onDraftChange({ ...draft, arrival: { type: 'fixed', time: time as FixedArrivalTime } })}>{time}</button>)}</div>
    <button className="next-button" type="button" onClick={onNext}>Next</button>
  </section>;
}
