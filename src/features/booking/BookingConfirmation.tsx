import type { CompletedBooking } from './booking.types';
import { formatLocalDate } from './local-date';

export function BookingConfirmation({ booking, onReturnHome }: { booking: CompletedBooking; onReturnHome: () => void }) {
  const arrival = booking.schedule.arrival.type === 'flexible' ? 'Flexible window: 9:00am-4:00pm' : booking.schedule.arrival.time;
  return <main className="confirmation"><span className="confirmation-mark">&#10003;</span><p className="eyebrow">CLEAN BOOKING</p><h1>Your appointment was booked.</h1><p className="confirmation-copy">We have saved your appointment details and will be in touch.</p><section aria-label="Booked appointment details"><p><strong>Date</strong>{formatLocalDate(booking.schedule.date)}</p><p><strong>Arrival</strong>{arrival}</p><p><strong>Address</strong>{[booking.details.address, booking.details.apartmentNumber].filter(Boolean).join(', ')}</p><p><strong>Billing Total</strong>${booking.billing.total}</p></section><button type="button" className="next-button" onClick={onReturnHome}>Return home</button></main>;
}
