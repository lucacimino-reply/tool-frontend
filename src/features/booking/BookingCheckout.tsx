import { useRef, useState } from 'react';

import { BookingRequestError } from './booking.api';
import type { BookingDraft, BookingQuote, ContactPreference, PaymentInput } from './booking.types';
import { formatLocalDate } from './local-date';

interface BookingCheckoutProps { draft: BookingDraft; quote: BookingQuote | null; quotePending: boolean; quoteErrors: Record<string, string>; onApplyPromo: (code: string) => Promise<void>; onPlaceOrder: (payment: PaymentInput, idempotencyKey: string) => Promise<void>; }
const frequencyLabels = { onetime: 'Onetime', weekly: 'Weekly', every_2_weeks: 'Every 2 weeks', every_4_weeks: 'Every 4 weeks' } as const;
const extraLabels = { inside_fridge: 'Inside fridge', inside_oven: 'Inside oven', inside_cabinets: 'Inside Cabinets' } as const;
const contactLabels: Record<ContactPreference, string> = { text: 'Text', call: 'Call', email: 'Email' };
function money(value: string) { return `$${value}`; }

interface PaymentForm { cardNumber: string; expiry: string; cvv: string; fullName: string; email: string; phone: string; contacts: ContactPreference[]; }
const emptyPayment: PaymentForm = { cardNumber: '', expiry: '', cvv: '', fullName: '', email: '', phone: '', contacts: [] };

export function validatePayment(payment: PaymentForm, now = new Date()): Record<string, string> {
  const errors: Record<string, string> = {};
  const cardDigits = payment.cardNumber.replace(/[ -]/g, '');
  if (!payment.cardNumber) errors.cardNumber = 'Card number is required.';
  else if (!/^[0-9 -]+$/.test(payment.cardNumber) || cardDigits.length < 12 || cardDigits.length > 19) errors.cardNumber = 'Card number must contain 12 to 19 digits, with spaces or hyphens only.';
  if (!payment.expiry) errors.expiry = 'Expiry date is required.';
  else if (payment.expiry.length > 7 || !/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(payment.expiry)) errors.expiry = 'Use MM/YY or MM/YYYY for a real month.';
  else {
    const [, monthText, yearText] = payment.expiry.match(/^(\d{2})\/(\d{2}|\d{4})$/)!;
    const year = yearText.length === 2 ? 2000 + Number(yearText) : Number(yearText);
    if (year < now.getFullYear() || (year === now.getFullYear() && Number(monthText) < now.getMonth() + 1)) errors.expiry = 'This card has expired.';
  }
  if (!payment.cvv) errors.cvv = 'CVV is required.';
  else if (!/^\d{3,4}$/.test(payment.cvv)) errors.cvv = 'CVV must be 3 or 4 digits.';
  const required = (key: 'fullName' | 'email' | 'phone', label: string, max: number) => {
    const value = payment[key].trim();
    if (!value) errors[key] = `${label} is required.`;
    else if (value.length > max) errors[key] = `${label} must be ${max} characters or fewer.`;
  };
  required('fullName', 'Full name', 100); required('email', 'Email address', 254); required('phone', 'Phone number', 100);
  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payment.email.trim())) errors.email = 'Enter a valid email address.';
  if (payment.contacts.length !== 1) errors.contactPreference = 'Select exactly one contact preference.';
  return errors;
}

function createIdempotencyKey() { return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`; }

export function BookingCheckout({ draft, quote, quotePending, quoteErrors, onApplyPromo, onPlaceOrder }: BookingCheckoutProps) {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [payment, setPayment] = useState<PaymentForm>(emptyPayment);
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
  const [orderError, setOrderError] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const actionRef = useRef<{ fingerprint: string; key: string } | null>(null);
  const billing = quote?.billing;
  const promoFieldError = promoError ?? quoteErrors.promoCode;
  async function applyPromo() {
    const code = promoInput.trim();
    if (!code) { setPromoError('Enter an eligible discount code.'); return; }
    if (code.length > 64) { setPromoError('Discount code must be 64 characters or fewer.'); return; }
    setPromoError(null); setApplying(true);
    try { await onApplyPromo(code); } catch (error) { setPromoError(error instanceof Error ? error.message : 'We could not apply that discount code.'); } finally { setApplying(false); }
  }
  const paymentError = (field: string) => paymentErrors[field] ?? paymentErrors[`payment.${field}`];
  const nonPaymentErrors = Object.entries(paymentErrors).filter(([field]) => !field.startsWith('payment.') && !['cardNumber', 'expiry', 'cvv', 'fullName', 'email', 'phone', 'contactPreference'].includes(field));
  function changePayment(field: Exclude<keyof PaymentForm, 'contacts'>, value: string) {
    if (field === 'cardNumber' && value.replace(/[ -]/g, '').length > 19) return;
    setPayment({ ...payment, [field]: value });
    setPaymentErrors((current) => ({ ...current, [field]: '', [`payment.${field}`]: '' }));
    setOrderError(null);
  }
  async function placeOrder() {
    if (placingOrder) return;
    const errors = validatePayment(payment);
    setPaymentErrors(errors);
    if (Object.keys(errors).length) return;
    const requestPayment: PaymentInput = { cardNumber: payment.cardNumber.replace(/[ -]/g, ''), expiry: payment.expiry, cvv: payment.cvv, fullName: payment.fullName.trim(), email: payment.email.trim(), phone: payment.phone.trim(), contactPreference: payment.contacts[0] };
    const fingerprint = JSON.stringify({ draft, payment: requestPayment });
    const idempotencyKey = actionRef.current?.fingerprint === fingerprint ? actionRef.current.key : createIdempotencyKey();
    actionRef.current = { fingerprint, key: idempotencyKey };
    setOrderError(null); setPlacingOrder(true);
    try { await onPlaceOrder(requestPayment, idempotencyKey); }
    catch (error) {
      if (error instanceof BookingRequestError && error.status === 422) setPaymentErrors(error.fieldErrors);
      else if (error instanceof BookingRequestError && error.status === 401) setOrderError('Your session has ended. Sign in again, then retry your order.');
      else if (error instanceof BookingRequestError && error.status === 409) setOrderError('This order could not be completed. Review your details and try again.');
      else setOrderError('We could not place your order. Please try again.');
    } finally { setPlacingOrder(false); }
  }
  return <section className="checkout" aria-labelledby="payment-heading">
    <section className="payment-preview"><h1 id="payment-heading">Payment Details</h1><p>Add in your payment details through our secure gateway.</p>
      <div className="payment-fields">
        <PaymentField label="Credit Card" value={payment.cardNumber} error={paymentError('cardNumber')} onChange={(value) => changePayment('cardNumber', value)} inputMode="numeric" />
        <PaymentField label="Exp. Date" value={payment.expiry} error={paymentError('expiry')} onChange={(value) => changePayment('expiry', value)} maxLength={7} placeholder="MM/YYYY" />
        <PaymentField label="CVV" value={payment.cvv} error={paymentError('cvv')} onChange={(value) => changePayment('cvv', value)} maxLength={4} inputMode="numeric" />
        <PaymentField label="Full Name" value={payment.fullName} error={paymentError('fullName')} onChange={(value) => changePayment('fullName', value)} maxLength={100} />
        <PaymentField label="Email Address" value={payment.email} error={paymentError('email')} onChange={(value) => changePayment('email', value)} maxLength={254} type="email" />
        <PaymentField label="Phone Number" value={payment.phone} error={paymentError('phone')} onChange={(value) => changePayment('phone', value)} maxLength={100} type="tel" />
        <fieldset className="contact-choices"><legend>How do we contact you</legend><div>{(Object.keys(contactLabels) as ContactPreference[]).map((contact) => <button key={contact} type="button" className={payment.contacts.includes(contact) ? 'selected' : ''} aria-pressed={payment.contacts.includes(contact)} onClick={() => setPayment({ ...payment, contacts: payment.contacts.includes(contact) ? payment.contacts.filter((item) => item !== contact) : [...payment.contacts, contact] })}>{contactLabels[contact]}</button>)}</div>{paymentError('contactPreference') && <p className="booking-field-error" role="alert">{paymentError('contactPreference')}</p>}</fieldset>
      </div>
      {orderError && <p className="booking-field-error" role="alert">{orderError}</p>}
      {nonPaymentErrors.map(([field, message]) => <p className="booking-field-error" role="alert" key={field}>{message}</p>)}
    </section>
    <aside className="billing-panel" aria-labelledby="billing-heading"><h2 id="billing-heading">Billing</h2>
      <section className="appointment-recap" aria-label="Appointment recap"><div><span>{draft.service.location}</span><span>{draft.service.rooms} Rooms</span><span>{draft.service.cleanType}</span></div><p><strong>{frequencyLabels[draft.details.frequency]}</strong>{draft.schedule?.date ? ` ${formatLocalDate(draft.schedule.date)}` : ''} at {draft.arrival.type === 'flexible' ? '9:00am-4:00pm' : draft.arrival.time}</p><p>{[draft.address, draft.apartmentNumber].filter(Boolean).join(', ') || 'Address to be added'}</p>{draft.details.extras.length > 0 && <p>Add-on: {draft.details.extras.map((extra) => extraLabels[extra]).join(', ')}</p>}</section>
      <div className="promo-row"><label>Discount<input aria-label="Discount code" value={promoInput} maxLength={65} onChange={(event) => { setPromoInput(event.target.value); setPromoError(null); }} aria-invalid={Boolean(promoFieldError)} /></label><button type="button" onClick={applyPromo} disabled={applying || quotePending}>Apply</button></div>
      {promoFieldError && <p className="booking-field-error" role="alert">{promoFieldError}</p>}
      {billing ? <section className="billing-lines" aria-live="polite"><p><span>Appointment Value</span><strong>{money(billing.appointmentValue)}</strong></p><p><span>Promo Discount</span><strong>{money(billing.promoDiscount)}</strong></p><p><span>Subtotal</span><strong>{money(billing.subtotal)}</strong></p><p><span>Tax</span><strong>{money(billing.tax)}</strong></p><p className="billing-total"><span>Total</span><strong>{money(billing.total)}</strong></p></section> : <p className="billing-empty">Your canonical billing snapshot will appear here.</p>}
      <button className="place-order" type="button" onClick={placeOrder} disabled={placingOrder}>{placingOrder ? 'Placing order...' : 'Place order'}</button>
    </aside>
  </section>;
}

function PaymentField({ label, value, error, onChange, type = 'text', maxLength, placeholder, inputMode }: { label: string; value: string; error?: string; onChange: (value: string) => void; type?: string; maxLength?: number; placeholder?: string; inputMode?: 'numeric' }) {
  return <label className="payment-field">{label}<input aria-label={label} type={type} value={value} maxLength={maxLength} placeholder={placeholder} inputMode={inputMode} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} />{error && <span className="booking-field-error" role="alert">{error}</span>}</label>;
}
