import { useState } from 'react';

import type { BookingDraft, BookingQuote } from './booking.types';
import { formatLocalDate } from './local-date';

interface BookingCheckoutProps { draft: BookingDraft; quote: BookingQuote | null; quotePending: boolean; quoteErrors: Record<string, string>; onApplyPromo: (code: string) => Promise<void>; }
const frequencyLabels = { onetime: 'Onetime', weekly: 'Weekly', every_2_weeks: 'Every 2 weeks', every_4_weeks: 'Every 4 weeks' } as const;
const extraLabels = { inside_fridge: 'Inside fridge', inside_oven: 'Inside oven', inside_cabinets: 'Inside Cabinets' } as const;
function money(value: string) { return `$${value}`; }

export function BookingCheckout({ draft, quote, quotePending, quoteErrors, onApplyPromo }: BookingCheckoutProps) {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const billing = quote?.billing;
  const promoFieldError = promoError ?? quoteErrors.promoCode;
  async function applyPromo() {
    const code = promoInput.trim();
    if (!code) { setPromoError('Enter an eligible discount code.'); return; }
    if (code.length > 64) { setPromoError('Discount code must be 64 characters or fewer.'); return; }
    setPromoError(null); setApplying(true);
    try { await onApplyPromo(code); } catch (error) { setPromoError(error instanceof Error ? error.message : 'We could not apply that discount code.'); } finally { setApplying(false); }
  }
  return <section className="checkout" aria-labelledby="payment-heading">
    <section className="payment-preview"><h1 id="payment-heading">Payment Details</h1><p>Add in your payment details through our secure gateway.</p><p className="payment-next">Payment entry is completed when you place your order.</p></section>
    <aside className="billing-panel" aria-labelledby="billing-heading"><h2 id="billing-heading">Billing</h2>
      <section className="appointment-recap" aria-label="Appointment recap"><div><span>{draft.service.location}</span><span>{draft.service.rooms} Rooms</span><span>{draft.service.cleanType}</span></div><p><strong>{frequencyLabels[draft.details.frequency]}</strong>{draft.schedule?.date ? ` ${formatLocalDate(draft.schedule.date)}` : ''} at {draft.arrival.type === 'flexible' ? '9:00am-4:00pm' : draft.arrival.time}</p><p>{[draft.address, draft.apartmentNumber].filter(Boolean).join(', ') || 'Address to be added'}</p>{draft.details.extras.length > 0 && <p>Add-on: {draft.details.extras.map((extra) => extraLabels[extra]).join(', ')}</p>}</section>
      <div className="promo-row"><label>Discount<input aria-label="Discount code" value={promoInput} maxLength={65} onChange={(event) => { setPromoInput(event.target.value); setPromoError(null); }} aria-invalid={Boolean(promoFieldError)} /></label><button type="button" onClick={applyPromo} disabled={applying || quotePending}>Apply</button></div>
      {promoFieldError && <p className="booking-field-error" role="alert">{promoFieldError}</p>}
      {billing ? <section className="billing-lines" aria-live="polite"><p><span>Appointment Value</span><strong>{money(billing.appointmentValue)}</strong></p><p><span>Promo Discount</span><strong>{money(billing.promoDiscount)}</strong></p><p><span>Subtotal</span><strong>{money(billing.subtotal)}</strong></p><p><span>Tax</span><strong>{money(billing.tax)}</strong></p><p className="billing-total"><span>Total</span><strong>{money(billing.total)}</strong></p></section> : <p className="billing-empty">Your canonical billing snapshot will appear here.</p>}
    </aside>
  </section>;
}
