import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../../src/App';
import { createBookingDraft } from '../../src/features/booking/booking.types';
import { addLocalDays, dateKey } from '../../src/features/booking/local-date';

function response(status: number, body: object = {}) { return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }); }
function renderSignedInApp() { vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(200, { customer: { id: '1', name: 'Customer', email: 'customer@example.com' } }))); return render(<App />); }
afterEach(() => vi.unstubAllGlobals());

describe('booking draft', () => {
  it('starts a fresh draft from home choices and updates the summary as service choices change', async () => {
    const user = userEvent.setup();
    renderSignedInApp();
    await waitFor(() => expect(screen.getByRole('button', { name: /Booking/ })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Residential' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Number of rooms' }), '6');
    await user.click(screen.getByRole('button', { name: /Booking/ }));
    expect(screen.getByText('Residential', { selector: '.summary-item strong' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Deep Clean' }));
    expect(screen.getByText('Deep Clean', { selector: '.summary-item strong' })).toBeInTheDocument();
  });

  it('keeps the draft through summary navigation and explicitly discards it', async () => {
    const user = userEvent.setup();
    renderSignedInApp();
    await waitFor(() => expect(screen.getByRole('button', { name: /Booking/ })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: /Booking/ }));
    await user.click(screen.getByRole('button', { name: 'House' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'Book Date' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Location/ }));
    expect(screen.getByRole('button', { name: 'House' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Discard booking' }));
    expect(screen.getByRole('heading', { name: /Your One Stop Cleaning/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Booking/ }));
    expect(screen.getByRole('button', { name: 'Studio' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('uses local calendar dates, retains changes across scheduling steps, and permits future navigation', async () => {
    const now = new Date();
    const today = now.getDate();
    const nextWeek = new Date(now.getFullYear(), now.getMonth() + 1, 27);
    const nextWeekLabel = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' }).format(nextWeek);
    const user = userEvent.setup();
    renderSignedInApp();
    await user.click(await screen.findByRole('button', { name: /Booking/ }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('button', { name: String(today) })).toHaveAttribute('aria-pressed', 'true');
    if (today > 1) expect(screen.getByRole('button', { name: String(today - 1) })).toBeDisabled();
    else expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    await user.click(screen.getByRole('button', { name: '20' }));
    expect(screen.getByText(new RegExp(new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' }).format(new Date(now.getFullYear(), now.getMonth() + 1, 20))), { selector: '.summary-item strong' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'Book Timing' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '20' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Next week' }));
    await user.click(screen.getByRole('button', { name: /Schedule Date/ }));
    expect(screen.getByText(new RegExp(nextWeekLabel), { selector: '.summary-item strong' })).toBeInTheDocument();
  });

  it('creates a schedule date from the customer local calendar day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 17, 10));
    expect(createBookingDraft({ location: 'Studio', rooms: 2, cleanType: 'Standard' }).schedule).toMatchObject({ date: '2026-04-17' });
  });

  it('normalizes compact-calendar week changes across month boundaries', () => {
    expect(dateKey(addLocalDays({ year: 2026, month: 2, day: 3 }, -7))).toBe('2026-02-24');
    expect(dateKey(addLocalDays({ year: 2026, month: 11, day: 28 }, 7))).toBe('2027-01-04');
  });

  it('offers exactly the fixed arrivals and keeps flexible and fixed arrivals mutually exclusive', async () => {
    const user = userEvent.setup();
    renderSignedInApp();
    await user.click(await screen.findByRole('button', { name: /Booking/ }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    const flexible = screen.getByRole('button', { name: /Flexible/ });
    const fixed = screen.getAllByRole('button', { name: /^(08:00am|08:30am|09:00am|09:30am|10:00am|10:30am|11:00am|11:30am|12:00pm|12:30pm|01:00pm|01:30pm|02:00pm|02:30pm|03:00pm|03:30pm|04:00pm)$/ });
    expect(fixed).toHaveLength(17);
    expect(flexible).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: '09:00am' }));
    expect(flexible).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: '09:00am' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(flexible);
    expect(flexible).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '09:00am' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('uses the required details defaults, validates trimmed inputs, and clears pets when No is selected', async () => {
    const user = userEvent.setup();
    renderSignedInApp();
    await user.click(await screen.findByRole('button', { name: /Booking/ }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('button', { name: 'Onetime' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Someone is home' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'No' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Yes' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Address is required.')).toBeInTheDocument();
    expect(screen.getByText('Pet description is required.')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Pet description' }), 'Cat');
    await user.click(screen.getByRole('button', { name: 'No' }));
    expect(screen.queryByRole('textbox', { name: 'Pet description' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Address' })).toHaveAttribute('maxlength', '255');
    expect(screen.getByRole('textbox', { name: 'Additional Notes' })).toHaveAttribute('maxlength', '2000');
    await user.type(screen.getByRole('textbox', { name: 'Address' }), '  1009 3rd Ave  ');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'Payment Details' })).toBeInTheDocument();
  });

  it('sends only normalized quote fields and renders the canonical appointment value', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/auth/session') return Promise.resolve(response(200, { customer: { id: '1', name: 'Customer', email: 'customer@example.com' } }));
      return Promise.resolve(response(200, { billing: { currency: 'USD', appointmentValue: '31.90' } }));
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /Booking/ }));
    await waitFor(() => expect(screen.getByLabelText('Appointment value')).toHaveTextContent('$31.90'));
    const call = fetchMock.mock.calls.find(([url]) => url === '/api/booking-quotes');
    expect(call?.[1]).toMatchObject({ credentials: 'include', method: 'POST' });
    expect(JSON.parse((call?.[1] as RequestInit).body as string)).toEqual({ service: { location: 'studio', rooms: 2, cleanType: 'standard' }, arrival: { type: 'flexible' }, details: { frequency: 'onetime', extras: [] } });
  });

  it('keeps the newer canonical quote when an earlier response arrives late', async () => {
    const user = userEvent.setup();
    let resolveFirst!: (value: Response) => void;
    const firstQuote = new Promise<Response>((resolve) => { resolveFirst = resolve; });
    let quoteCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url === '/api/auth/session') return Promise.resolve(response(200, { customer: { id: '1', name: 'Customer', email: 'customer@example.com' } }));
      quoteCount += 1;
      return quoteCount === 1 ? firstQuote : Promise.resolve(response(200, { billing: { currency: 'USD', appointmentValue: '40.00' } }));
    }));
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /Booking/ }));
    await user.click(screen.getByRole('button', { name: 'House' }));
    await waitFor(() => expect(screen.getByLabelText('Appointment value')).toHaveTextContent('$40.00'));
    resolveFirst(response(200, { billing: { currency: 'USD', appointmentValue: '20.00' } }));
    await waitFor(() => expect(screen.getByLabelText('Appointment value')).toHaveTextContent('$40.00'));
  });

  it('renders quote field errors without replacing the prior canonical value', async () => {
    const user = userEvent.setup();
    let quoteCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url === '/api/auth/session') return Promise.resolve(response(200, { customer: { id: '1', name: 'Customer', email: 'customer@example.com' } }));
      quoteCount += 1;
      return quoteCount === 1 ? Promise.resolve(response(200, { billing: { currency: 'USD', appointmentValue: '31.90' } })) : Promise.resolve(response(422, { code: 'invalid', message: 'Invalid extra', fieldErrors: { 'details.extras': 'Choose valid extras.' } }));
    }));
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /Booking/ }));
    await waitFor(() => expect(screen.getByLabelText('Appointment value')).toHaveTextContent('$31.90'));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Inside fridge ($25.00)' }));
    expect(await screen.findByText('details.extras: Choose valid extras.')).toBeInTheDocument();
    expect(screen.getByLabelText('Appointment value')).toHaveTextContent('$31.90');
  });
});

afterEach(() => vi.useRealTimers());
