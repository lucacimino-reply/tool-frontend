import { useEffect, useState } from 'react';

import { AuthPage } from './features/auth/AuthPage';
import { getSession } from './features/auth/auth.api';
import type { AuthenticatedCustomer } from './features/auth/auth.types';
import { BookingStepOne } from './features/booking/BookingStepOne';
import { HomePage, type HomeSelection } from './features/home/HomePage';

export default function App() {
  const [route, setRoute] = useState<'home' | 'login' | 'signup' | 'booking'>('home');
  const [selection, setSelection] = useState<HomeSelection>({ location: 'Studio', rooms: 2, cleanType: 'Standard' });
  const [pendingBooking, setPendingBooking] = useState<HomeSelection | null>(null);
  const [customer, setCustomer] = useState<AuthenticatedCustomer | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'loading' | 'authenticated' | 'signed-out'>('loading');

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
      setRoute('booking');
    } else {
      setPendingBooking(currentSelection);
      setRoute('login');
    }
  }

  function authenticated(nextCustomer: AuthenticatedCustomer) {
    setCustomer(nextCustomer);
    setSessionStatus('authenticated');
    if (pendingBooking) { setSelection(pendingBooking); setPendingBooking(null); setRoute('booking'); }
    else setRoute('home');
  }

  function leaveAuthentication() { setPendingBooking(null); setRoute('home'); }

  if (route === 'booking') return <BookingStepOne selection={selection} onSelectionChange={setSelection} onExit={() => setRoute('home')} />;
  if (route === 'login' || route === 'signup') return <AuthPage mode={route} onModeChange={setRoute} onSuccess={authenticated} onExit={leaveAuthentication} />;
  return <HomePage selection={selection} onSelectionChange={setSelection} onLogin={() => setRoute('login')} onBooking={beginBooking} onWordmark={() => setPendingBooking(null)} />;
}
