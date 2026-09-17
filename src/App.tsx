import { useEffect, useRef, useState } from 'react';

import { AuthPage } from './features/auth/AuthPage';
import { getSession } from './features/auth/auth.api';
import type { AuthenticatedCustomer } from './features/auth/auth.types';
import { BookingStepOne } from './features/booking/BookingStepOne';
import { BookingLayout } from './features/booking/BookingLayout';
import { BookingSchedule } from './features/booking/BookingSchedule';
import { BookingTiming } from './features/booking/BookingTiming';
import { createBooking, quoteBooking, BookingRequestError, QuoteRequestError } from './features/booking/booking.api';
import { BookingDetails } from './features/booking/BookingDetails';
import { BookingCheckout, emptyPayment, type PaymentForm } from './features/booking/BookingCheckout';
import { createBookingDraft, toBookingQuoteRequest, toCreateBookingRequest, type BookingDraft, type BookingQuote, type BookingStep, type CompletedBooking, type PaymentInput } from './features/booking/booking.types';
import { BookingConfirmation } from './features/booking/BookingConfirmation';
import { HomePage, type HomeSelection } from './features/home/HomePage';

export default function App() {
  const [route, setRoute] = useState<'home' | 'login' | 'signup' | 'booking' | 'confirmation'>('home');
  const [selection, setSelection] = useState<HomeSelection>({ location: 'Studio', rooms: 2, cleanType: 'Standard' });
  const [pendingBooking, setPendingBooking] = useState<HomeSelection | null>(null);
  const [customer, setCustomer] = useState<AuthenticatedCustomer | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'loading' | 'authenticated' | 'signed-out'>('loading');
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>(1);
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [quotedRequestKey, setQuotedRequestKey] = useState<string | null>(null);
  const [quoteErrors, setQuoteErrors] = useState<Record<string, string>>({});
  const [quotePending, setQuotePending] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<CompletedBooking | null>(null);
  const [payment, setPayment] = useState<PaymentForm>(emptyPayment);
  const quoteRequestId = useRef(0);
  const quoteRequest = draft ? toBookingQuoteRequest(draft) : null;
  const quoteRequestKey = quoteRequest ? JSON.stringify(quoteRequest) : null;

  useEffect(() => {
    getSession()
      .then((nextCustomer) => {
        setCustomer(nextCustomer);
        setSessionStatus('authenticated');
      })
      .catch(() => {
        setCustomer(null);
        setSessionStatus('signed-out');
      });
  }, []);

  useEffect(() => {
    if (!pendingBooking || sessionStatus === 'loading') return;
    if (customer) {
      setSelection(pendingBooking);
      setPendingBooking(null);
      setDraft(createBookingDraft(pendingBooking));
      setQuote(null);
      setQuotedRequestKey(null);
      setQuoteErrors({});
      setPayment(emptyPayment);
      setBookingStep(1);
      setRoute('booking');
    } else {
      setRoute('login');
    }
  }, [customer, pendingBooking, sessionStatus]);

  useEffect(() => {
    if (!quoteRequest || !customer) return;
    const requestId = ++quoteRequestId.current;
    setQuotePending(true);
    quoteBooking(quoteRequest).then((nextQuote) => {
      if (requestId === quoteRequestId.current) { setQuote(nextQuote); setQuotedRequestKey(quoteRequestKey); setQuoteErrors({}); setQuotePending(false); }
    }).catch((error: unknown) => {
      if (requestId !== quoteRequestId.current) return;
      setQuotePending(false);
      // The prior successful quote remains the only canonical amount after a rejected replacement.
      setQuotedRequestKey(quoteRequestKey);
      if (error instanceof QuoteRequestError && error.status === 401) { setQuoteErrors({ quote: 'Your session has ended. Sign in again, then retry your quote.' }); return; }
      if (error instanceof QuoteRequestError) setQuoteErrors(Object.keys(error.fieldErrors).length ? error.fieldErrors : { quote: error.message });
      else setQuoteErrors({ quote: 'We could not update your appointment value. Please try again.' });
    });
  }, [customer, quoteRequestKey]);

  const currentQuote = quotedRequestKey === quoteRequestKey ? quote : null;

  function beginBooking(currentSelection: HomeSelection) {
    if (sessionStatus === 'loading') {
      setPendingBooking(currentSelection);
    } else if (customer) {
      setSelection(currentSelection);
      setDraft(createBookingDraft(currentSelection));
      setQuote(null);
      setQuotedRequestKey(null);
      setQuoteErrors({});
      setPayment(emptyPayment);
      setBookingStep(1);
      setRoute('booking');
    } else {
      setPendingBooking(currentSelection);
      setRoute('login');
    }
  }

  function authenticated(nextCustomer: AuthenticatedCustomer) {
    setCustomer(nextCustomer);
    setSessionStatus('authenticated');
    if (pendingBooking) { setSelection(pendingBooking); setDraft(createBookingDraft(pendingBooking)); setQuote(null); setQuotedRequestKey(null); setQuoteErrors({}); setPayment(emptyPayment); setBookingStep(1); setPendingBooking(null); setRoute('booking'); }
    else setRoute('home');
  }

  function leaveAuthentication() { setPendingBooking(null); setRoute('home'); }

  function discardBooking() { setDraft(null); setQuote(null); setQuotedRequestKey(null); setQuoteErrors({}); setPayment(emptyPayment); setBookingStep(1); setRoute('home'); }

  async function applyPromo(code: string) {
    if (!draft) return;
    try {
      const nextQuote = await quoteBooking({ ...toBookingQuoteRequest(draft), promoCode: code });
      const nextDraft = { ...draft, promoCode: nextQuote.billing.promoCode ?? code };
      setDraft(nextDraft);
      setQuote(nextQuote);
      setQuotedRequestKey(JSON.stringify(toBookingQuoteRequest(nextDraft)));
      setQuoteErrors({});
    } catch (error) {
      if (error instanceof QuoteRequestError && error.status === 422) throw new Error(error.fieldErrors.promoCode ?? 'That discount code is not eligible.');
      if (error instanceof QuoteRequestError && error.status === 401) throw new Error('Your session has ended. Sign in again, then retry.');
      throw new Error('We could not apply that discount code. Please try again.');
    }
  }

  async function placeOrder(payment: PaymentInput, idempotencyKey: string) {
    if (!draft) throw new Error('Your booking draft is no longer available.');
    try {
      const completed = await createBooking(toCreateBookingRequest(draft, payment), idempotencyKey);
      setCompletedBooking(completed);
      setDraft(null);
      setQuote(null);
      setQuotedRequestKey(null);
      setQuoteErrors({});
      setPayment(emptyPayment);
      setRoute('confirmation');
    } catch (error) {
      if (error instanceof BookingRequestError) throw error;
      throw new Error('We could not place your order. Please try again.');
    }
  }

  if (route === 'booking' && draft) return <BookingLayout draft={draft} step={bookingStep} onNavigate={setBookingStep} onDiscard={discardBooking} quote={currentQuote} quoteErrors={quoteErrors} quotePending={quotePending}>
    {bookingStep === 1 ? <BookingStepOne draft={draft} onDraftChange={setDraft} onNext={() => setBookingStep(2)} /> : bookingStep === 2 ? <BookingSchedule draft={draft} onDraftChange={setDraft} onNext={() => setBookingStep(3)} /> : bookingStep === 3 ? <BookingTiming draft={draft} onDraftChange={setDraft} onNext={() => setBookingStep(4)} /> : bookingStep === 4 ? <BookingDetails draft={draft} quoteErrors={quoteErrors} onDraftChange={setDraft} onNext={() => setBookingStep(5)} /> : <BookingCheckout draft={draft} quote={currentQuote} quotePending={quotePending} quoteErrors={quoteErrors} payment={payment} onPaymentChange={setPayment} onApplyPromo={applyPromo} onPlaceOrder={placeOrder} />}
  </BookingLayout>;
  if (route === 'confirmation' && completedBooking) return <BookingConfirmation booking={completedBooking} onReturnHome={() => setRoute('home')} />;
  if (route === 'login' || route === 'signup') return <AuthPage mode={route} onModeChange={setRoute} onSuccess={authenticated} onExit={leaveAuthentication} />;
  return <HomePage selection={selection} onSelectionChange={setSelection} onLogin={() => setRoute('login')} onBooking={beginBooking} onWordmark={() => setPendingBooking(null)} />;
}
