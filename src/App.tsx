import { useEffect, useState } from 'react';

import { AuthPage } from './features/auth/AuthPage';
import { getSession } from './features/auth/auth.api';
import type { AuthenticatedCustomer } from './features/auth/auth.types';
import { BookingStepOne } from './features/booking/BookingStepOne';
import { BookingLayout } from './features/booking/BookingLayout';
import { BookingSchedule } from './features/booking/BookingSchedule';
import { BookingTiming } from './features/booking/BookingTiming';
import { createBookingDraft, type BookingDraft, type BookingStep } from './features/booking/booking.types';
import { HomePage, type HomeSelection } from './features/home/HomePage';

export default function App() {
  const [route, setRoute] = useState<'home' | 'login' | 'signup' | 'booking'>('home');
  const [selection, setSelection] = useState<HomeSelection>({ location: 'Studio', rooms: 2, cleanType: 'Standard' });
  const [pendingBooking, setPendingBooking] = useState<HomeSelection | null>(null);
  const [customer, setCustomer] = useState<AuthenticatedCustomer | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'loading' | 'authenticated' | 'signed-out'>('loading');
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>(1);

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
      setBookingStep(1);
      setRoute('booking');
    } else {
      setRoute('login');
    }
  }, [customer, pendingBooking, sessionStatus]);

  function beginBooking(currentSelection: HomeSelection) {
    if (sessionStatus === 'loading') {
      setPendingBooking(currentSelection);
    } else if (customer) {
      setSelection(currentSelection);
      setDraft(createBookingDraft(currentSelection));
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
    if (pendingBooking) { setSelection(pendingBooking); setDraft(createBookingDraft(pendingBooking)); setBookingStep(1); setPendingBooking(null); setRoute('booking'); }
    else setRoute('home');
  }

  function leaveAuthentication() { setPendingBooking(null); setRoute('home'); }

  function discardBooking() { setDraft(null); setBookingStep(1); setRoute('home'); }

  if (route === 'booking' && draft) return <BookingLayout draft={draft} step={bookingStep} onNavigate={setBookingStep} onDiscard={discardBooking}>
    {bookingStep === 1 ? <BookingStepOne draft={draft} onDraftChange={setDraft} onNext={() => setBookingStep(2)} /> : bookingStep === 2 ? <BookingSchedule draft={draft} onDraftChange={setDraft} onNext={() => setBookingStep(3)} /> : bookingStep === 3 ? <BookingTiming draft={draft} onDraftChange={setDraft} onNext={() => setBookingStep(4)} /> : <section className="booking-placeholder" aria-labelledby="booking-step-heading"><h1 id="booking-step-heading">{bookingStep === 4 ? 'Add Your Address & Details' : 'Payment Details'}</h1><p>This booking step will be available next.</p></section>}
  </BookingLayout>;
  if (route === 'login' || route === 'signup') return <AuthPage mode={route} onModeChange={setRoute} onSuccess={authenticated} onExit={leaveAuthentication} />;
  return <HomePage selection={selection} onSelectionChange={setSelection} onLogin={() => setRoute('login')} onBooking={beginBooking} onWordmark={() => setPendingBooking(null)} />;
}
