import type { ReactNode } from 'react';

import type { BookingDraft, BookingStep } from './booking.types';

interface BookingLayoutProps {
  draft: BookingDraft;
  step: BookingStep;
  onNavigate: (step: BookingStep) => void;
  onDiscard: () => void;
  children: ReactNode;
}

const formatDate = (date?: string) => date ? new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'long', day: 'numeric' }).format(new Date(`${date}T00:00:00`)) : '--';

export function BookingLayout({ draft, step, onNavigate, onDiscard, children }: BookingLayoutProps) {
  const serviceItems: Array<{ label: string; value: string; target: BookingStep }> = [
    { label: 'Location', value: draft.service.location, target: 1 },
    { label: 'Rooms', value: String(draft.service.rooms), target: 1 },
    { label: 'Clean Type', value: draft.service.cleanType, target: 1 },
    { label: 'Schedule Date', value: formatDate(draft.schedule?.date), target: 2 },
    { label: 'Address', value: draft.address || '--', target: 4 },
  ];

  return <main className="booking-page">
    <header className="booking-summary" aria-label="Booking summary">
      <button type="button" onClick={onDiscard} aria-label="Discard booking">×</button>
      {serviceItems.map((item) => <button className={step === item.target ? 'summary-item active' : 'summary-item'} type="button" key={item.label} onClick={() => onNavigate(item.target)}>
        <strong>{item.value}</strong><span>{item.label}</span>
      </button>)}
      <aside aria-label="Appointment value"><strong>--</strong><span>Appointment Value</span></aside>
    </header>
    {children}
  </main>;
}
