import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../../src/App';

const customer = { customer: { id: 'bd7cf2e6-5c79-4dc2-8f1a-7431e6cd4449', name: 'Clean Customer', email: 'customer@example.com' } };

function response(status: number, body: object = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function mockFetch(...responses: Response[]) {
  const fetchMock = vi.fn();
  responses.forEach((next) => fetchMock.mockResolvedValueOnce(next));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('authentication and booking resumption', () => {
  it('restores an existing cookie-backed browser session and opens Booking directly', async () => {
    const fetchMock = mockFetch(response(200, customer));
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/auth/session', expect.objectContaining({ credentials: 'include' })));
    await user.click(screen.getByRole('button', { name: /Booking/ }));
    expect(screen.getByRole('heading', { name: /Customize Your\s*Requirements/ })).toBeInTheDocument();
  });

  it('normalizes login email, preserves password whitespace, and shows the exact 401 feedback', async () => {
    const fetchMock = mockFetch(response(401), response(401));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Login' }));
    await user.type(screen.getByLabelText('Email'), '  customer@example.com  ');
    await user.type(screen.getByLabelText('Password'), ' password ');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('The email or password you entered is incorrect.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith('/api/auth/login', expect.objectContaining({ body: JSON.stringify({ email: 'customer@example.com', password: ' password ' }), credentials: 'include' }));
  });

  it('validates signup consent and maps duplicate email feedback', async () => {
    mockFetch(response(401), response(409, { fieldErrors: { email: 'An account already uses this email.' } }));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Login' }));
    await user.click(screen.getByRole('button', { name: 'Sign up' }));
    await user.type(screen.getByLabelText('Name'), 'New Customer');
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Enter New Password'), 'password');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('You must accept the Terms of Service and Privacy Policy.')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('An account already uses this email.')).toBeInTheDocument();
  });

  it('toggles password visibility without changing the entered password', async () => {
    mockFetch(response(401));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Login' }));
    const password = screen.getByLabelText('Password');
    await user.type(password, 'password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');
    expect(password).toHaveValue('password');
  });

  it('retains selected home choices only through a successful signup booking handoff', async () => {
    mockFetch(response(401), response(201, customer));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Residential' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Number of rooms' }), '6');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Clean type' }), 'Post Construction');
    await user.click(screen.getByRole('button', { name: /Booking/ }));
    await user.click(screen.getByRole('button', { name: 'Sign up' }));
    await user.type(screen.getByLabelText('Name'), 'New Customer');
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Enter New Password'), 'password');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByRole('heading', { name: /Customize Your\s*Requirements/ })).toBeInTheDocument();
    expect(screen.getByText('Residential', { selector: '.booking-summary strong' })).toBeInTheDocument();
    expect(screen.getByText('6', { selector: '.booking-summary strong' })).toBeInTheDocument();
    expect(screen.getByText('Post Construction', { selector: '.booking-summary strong' })).toBeInTheDocument();
  });

  it('resumes a pending booking after a successful login', async () => {
    mockFetch(response(401), response(200, customer));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'House' }));
    await user.click(screen.getByRole('button', { name: /Booking/ }));
    await user.type(screen.getByLabelText('Email'), 'customer@example.com');
    await user.type(screen.getByLabelText('Password'), 'password');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('House', { selector: '.booking-summary strong' })).toBeInTheDocument();
  });

  it('returns standalone authentication and unauthenticated exits home without a booking', async () => {
    mockFetch(response(401), response(200, customer));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Login' }));
    await user.type(screen.getByLabelText('Email'), 'customer@example.com');
    await user.type(screen.getByLabelText('Password'), 'password');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByRole('heading', { name: /Your One Stop Cleaning/ })).toBeInTheDocument();
  });

  it('clears a pending booking when authentication is exited', async () => {
    mockFetch(response(401));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Commercial' }));
    await user.click(screen.getByRole('button', { name: /Booking/ }));
    await user.click(screen.getByRole('button', { name: 'Clean home' }));
    expect(screen.getByRole('heading', { name: /Your One Stop Cleaning/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Login' }));
    await user.click(screen.getByRole('button', { name: 'Clean home' }));
    expect(screen.queryByRole('heading', { name: /Customize Your/ })).not.toBeInTheDocument();
  });
});
