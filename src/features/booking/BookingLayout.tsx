import type { ReactNode } from 'react';

import type { BookingDraft, BookingQuote, BookingStep } from './booking.types';
import { formatLocalDate } from './local-date';

interface BookingLayoutProps {
  draft: BookingDraft;
  step: BookingStep;
  onNavigate: (step: BookingStep) => void;
  onDiscard: () => void;
  quote: BookingQuote | null;
  quoteErrors: Record<string, string>;
  quotePending: boolean;
  children: ReactNode;
}

export function BookingLayout({ draft, step, onNavigate, onDiscard, quote, quoteErrors, quotePending, children }: BookingLayoutProps) {
  const serviceItems: Array<{ label: string; value: string; target: BookingStep }> = [
    { label: 'Location', value: draft.service.location, target: 1 },
    { label: 'Rooms', value: String(draft.service.rooms), target: 1 },
    { label: 'Clean Type', value: draft.service.cleanType, target: 1 },
    { label: 'Schedule Date', value: draft.schedule?.date ? formatLocalDate(draft.schedule.date) : '--', target: 2 },
    { label: 'Address', value: draft.address || '--', target: 4 },
  ];

  return <main className="booking-page">
    <header className="booking-summary" aria-label="Booking summary">
      <button type="button" onClick={onDiscard} aria-label="Discard booking">×</button>
      {serviceItems.map((item) => <button className={step === item.target ? 'summary-item active' : 'summary-item'} type="button" key={item.label} onClick={() => onNavigate(item.target)}>
        <strong>{item.value}</strong><span>{item.label}</span>
      </button>)}
      <aside aria-label="Appointment value" aria-busy={quotePending}><strong>{quote?.billing?.currency === 'USD' ? `$${quote.billing.appointmentValue}` : '--'}</strong><span>{quotePending ? 'Updating value' : 'Appointment Value'}</span></aside>
    </header>
    {Object.keys(quoteErrors).length > 0 && <section className="quote-error" role="alert"><strong>We could not update your appointment value.</strong>{Object.entries(quoteErrors).map(([field, message]) => <p key={field}>{field}: {message}</p>)}</section>}
    {children}
  </main>;
}
