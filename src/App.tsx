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

  useEffect(() => { getSession().then(setCustomer).catch(() => setCustomer(null)); }, []);

  function beginBooking(currentSelection: HomeSelection) {
    if (customer) { setSelection(currentSelection); setRoute('booking'); }
    else { setPendingBooking(currentSelection); setRoute('login'); }
  }

  function authenticated(nextCustomer: AuthenticatedCustomer) {
    setCustomer(nextCustomer);
    if (pendingBooking) { setSelection(pendingBooking); setPendingBooking(null); setRoute('booking'); }
    else setRoute('home');
  }

  function leaveAuthentication() { setPendingBooking(null); setRoute('home'); }

  if (route === 'booking') return <BookingStepOne selection={selection} onSelectionChange={setSelection} onExit={() => setRoute('home')} />;
  if (route === 'login' || route === 'signup') return <AuthPage mode={route} onModeChange={setRoute} onSuccess={authenticated} onExit={leaveAuthentication} />;
  return <HomePage selection={selection} onSelectionChange={setSelection} onLogin={() => setRoute('login')} onBooking={beginBooking} onWordmark={() => setPendingBooking(null)} />;
}
