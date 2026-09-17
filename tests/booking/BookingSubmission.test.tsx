import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../../src/App';
import { validatePayment } from '../../src/features/booking/BookingCheckout';

function response(status: number, body: object = {}) { return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }); }
function quote() { return { billing: { currency: 'USD', baseService: '40.00', flexibleDiscount: '-8.10', extrasTotal: '0.00', frequencyDiscount: '0.00', appointmentValue: '31.90', promoDiscount: '0.00', subtotal: '31.90', tax: '3.19', total: '35.09' } }; }
function completed() { return { id: 'b1', customer: { id: 'c1', name: 'Customer', email: 'customer@example.com' }, service: { location: 'studio', rooms: 2, cleanType: 'standard' }, schedule: { date: '2030-06-15', customerTimeZone: 'America/New_York', arrival: { type: 'flexible' } }, details: { frequency: 'onetime', address: 'Response address', accessMethod: 'someone_is_home', extras: [], hasPets: false }, contact: { fullName: 'Ada Lovelace', email: 'ada@example.com', phone: '555 0100', contactPreference: 'email', cardLastFour: '1111' }, billing: quote().billing, createdAt: '2030-01-01T00:00:00Z' }; }

function installFetch(bookingHandler: () => Promise<Response> | Response) {
  const fetchMock = vi.fn().mockImplementation((url: string) => {
    if (url === '/api/auth/session') return Promise.resolve(response(200, { customer: { id: 'c1', name: 'Customer', email: 'customer@example.com' } }));
    if (url === '/api/booking-quotes') return Promise.resolve(response(200, quote()));
    return bookingHandler();
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function openCheckout(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: /Booking/ }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.type(screen.getByRole('textbox', { name: 'Address' }), '1009 3rd Ave');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await screen.findByRole('heading', { name: 'Billing' });
}

async function fillPayment(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('textbox', { name: 'Credit Card' }), '4111-1111 1111 1111');
  await user.type(screen.getByRole('textbox', { name: 'Exp. Date' }), '12/2035');
  await user.type(screen.getByRole('textbox', { name: 'CVV' }), '123');
  await user.type(screen.getByRole('textbox', { name: 'Full Name' }), ' Ada Lovelace ');
  await user.type(screen.getByRole('textbox', { name: 'Email Address' }), ' ada@example.com ');
  await user.type(screen.getByRole('textbox', { name: 'Phone Number' }), ' 555 0100 ');
  await user.click(screen.getByRole('button', { name: 'Email' }));
}

afterEach(() => vi.unstubAllGlobals());

describe('booking submission', () => {
  it('validates payment boundaries and exactly one contact preference in customer-local time', () => {
    expect(validatePayment({ cardNumber: '123', expiry: '13/2035', cvv: '12', fullName: ' ', email: 'bad', phone: ' ', contacts: [] }, new Date(2030, 5, 1))).toMatchObject({ cardNumber: expect.any(String), expiry: expect.any(String), cvv: expect.any(String), fullName: expect.any(String), email: expect.any(String), phone: expect.any(String), contactPreference: expect.any(String) });
    expect(validatePayment({ cardNumber: '4111 1111 1111 1111', expiry: '05/2030', cvv: '123', fullName: 'Ada', email: 'ada@example.com', phone: '555', contacts: ['email'] }, new Date(2030, 5, 1))).toHaveProperty('expiry');
  });

  it('submits the complete request once and renders only response-driven confirmation', async () => {
    const user = userEvent.setup();
    const fetchMock = installFetch(() => response(201, completed()));
    render(<App />);
    await openCheckout(user); await fillPayment(user);
    await user.click(screen.getByRole('button', { name: 'Place order' }));
    await screen.findByRole('heading', { name: 'Your appointment was booked.' });
    const call = fetchMock.mock.calls.find(([url]) => url === '/api/bookings');
    expect(call).toBeDefined();
    const [, init] = call! as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Idempotency-Key']).not.toEqual('');
    expect(JSON.parse(init.body as string)).toMatchObject({ schedule: { customerTimeZone: expect.any(String), arrival: { type: 'flexible' } }, details: { address: '1009 3rd Ave' }, payment: { cardNumber: '4111111111111111', cvv: '123', fullName: 'Ada Lovelace' } });
    expect(screen.getByLabelText('Booked appointment details')).toHaveTextContent('Response address');
    expect(screen.queryByText('4111111111111111')).not.toBeInTheDocument();
    expect(screen.queryByText('123')).not.toBeInTheDocument();
  });

  it('prevents pending repeats and retains payment when the API rejects the order', async () => {
    const user = userEvent.setup();
    let resolveBooking: ((value: Response) => void) | undefined;
    const booking = new Promise<Response>((resolve) => { resolveBooking = resolve; });
    const fetchMock = installFetch(() => booking);
    render(<App />);
    await openCheckout(user); await fillPayment(user);
    const order = screen.getByRole('button', { name: 'Place order' });
    await user.click(order); await user.click(order);
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/bookings')).toHaveLength(1);
    resolveBooking!(response(422, { message: 'Invalid payment', fieldErrors: { 'payment.cvv': 'CVV was declined.' } }));
    expect(await screen.findByText('CVV was declined.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Credit Card' })).toHaveValue('4111-1111 1111 1111');
  });
});
