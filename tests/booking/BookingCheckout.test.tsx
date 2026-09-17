import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../../src/App';

function response(status: number, body: object = {}) { return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }); }
function quote(overrides: object = {}) { return { billing: { currency: 'USD', baseService: '40.00', flexibleDiscount: '-8.10', extrasTotal: '0.00', frequencyDiscount: '0.00', appointmentValue: '31.90', promoDiscount: '0.00', subtotal: '31.90', tax: '3.19', total: '35.09', ...overrides } }; }

function installFetch(quoteHandler: (body: { promoCode?: string }) => Response) {
  const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    if (url === '/api/auth/session') return Promise.resolve(response(200, { customer: { id: '1', name: 'Customer', email: 'customer@example.com' } }));
    return Promise.resolve(quoteHandler(JSON.parse(init?.body as string)));
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

afterEach(() => vi.unstubAllGlobals());

describe('booking checkout billing', () => {
  it('uses the canonical quote for every billing line and summary appointment value', async () => {
    const user = userEvent.setup();
    installFetch(() => response(200, quote()));
    render(<App />);
    await openCheckout(user);
    await waitFor(() => expect(screen.getByLabelText('Appointment value')).toHaveTextContent('$31.90'));
    expect(screen.getByText('Promo Discount').parentElement).toHaveTextContent('$0.00');
    expect(screen.getByText('Subtotal').parentElement).toHaveTextContent('$31.90');
    expect(screen.getByText('Tax').parentElement).toHaveTextContent('$3.19');
    expect(screen.getByText('Total').parentElement).toHaveTextContent('$35.09');
  });

  it('trims promo input, replaces the quote, and retains it through rejected replacements', async () => {
    const user = userEvent.setup();
    const fetchMock = installFetch((body) => body.promoCode?.toUpperCase() === 'CLEAN10'
      ? response(200, quote({ promoCode: 'CLEAN10', promoDiscount: '-10.00', subtotal: '21.90', tax: '2.19', total: '24.09' }))
      : body.promoCode === 'NOPE' ? response(422, { code: 'ineligible', message: 'Ineligible', fieldErrors: { promoCode: 'That discount code is not eligible.' } }) : response(200, quote()));
    render(<App />);
    await openCheckout(user);
    const discount = screen.getByRole('textbox', { name: 'Discount code' });
    await user.type(discount, '  clean10  ');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() => expect(screen.getByText('Promo Discount').parentElement).toHaveTextContent('$-10.00'));
    const promoCall = fetchMock.mock.calls.find(([url, init]) => url === '/api/booking-quotes' && JSON.parse((init as RequestInit).body as string).promoCode === 'clean10');
    expect(promoCall).toBeDefined();
    await user.clear(discount);
    await user.type(discount, 'NOPE');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(await screen.findByText('That discount code is not eligible.')).toBeInTheDocument();
    expect(screen.getByText('Total').parentElement).toHaveTextContent('$24.09');
  });

  it('rejects empty and overlength promos without requesting or replacing billing', async () => {
    const user = userEvent.setup();
    const fetchMock = installFetch(() => response(200, quote({ promoCode: 'CLEAN10', promoDiscount: '-10.00', subtotal: '21.90', tax: '2.19', total: '24.09' })));
    render(<App />);
    await openCheckout(user);
    const discount = screen.getByRole('textbox', { name: 'Discount code' });
    const callsBefore = fetchMock.mock.calls.length;
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByText('Enter an eligible discount code.')).toBeInTheDocument();
    await user.type(discount, 'x'.repeat(65));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByText('Discount code must be 64 characters or fewer.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(callsBefore);
  });

  it('returns to the mandated details step without losing the checkout draft', async () => {
    const user = userEvent.setup();
    installFetch(() => response(200, quote()));
    render(<App />);
    await openCheckout(user);
    await user.click(screen.getByRole('button', { name: /Address/ }));
    expect(screen.getByRole('textbox', { name: 'Address' })).toHaveValue('1009 3rd Ave');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByRole('heading', { name: 'Billing' })).toBeInTheDocument();
    expect(screen.getByLabelText('Appointment recap')).toHaveTextContent('1009 3rd Ave');
  });
});
