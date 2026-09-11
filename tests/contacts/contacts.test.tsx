import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ContactForm } from '../../src/features/contacts/ContactForm';
import { ContactsPage } from '../../src/features/contacts/ContactsPage';
import { createContactSubmission } from '../../src/features/contacts/contacts.api';

describe('STUDIO contact form', () => {
  it('renders the required STUDIO frame and contact controls', () => {
    render(<ContactsPage />);
    expect(screen.getByText('STUDIO')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contact Us' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('shows required errors and makes no request for empty values', async () => {
    const submitContact = vi.fn();
    render(<ContactForm submitContact={submitContact} />);
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByText('Name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email Address is required.')).toBeInTheDocument();
    expect(submitContact).not.toHaveBeenCalled();
  });

  it('enforces name and email boundaries without normalizing values', async () => {
    const submitContact = vi.fn().mockResolvedValue(true);
    render(<ContactForm submitContact={submitContact} />);
    const name = screen.getByLabelText('Name');
    const email = screen.getByLabelText('Email Address');
    await userEvent.type(name, 'a'.repeat(101));
    await userEvent.type(email, 'person@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByText('Name must be 100 characters or fewer.')).toBeInTheDocument();
    expect(submitContact).not.toHaveBeenCalled();

    fireEvent.change(name, { target: { value: 'N' } });
    fireEvent.change(email, { target: { value: 'invalid' } });
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();

    fireEvent.change(email, { target: { value: `${'a'.repeat(242)}@example.com` } });
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(submitContact).toHaveBeenCalledWith({ name: 'N', email: `${'a'.repeat(242)}@example.com` });

    fireEvent.change(name, { target: { value: 'a'.repeat(100) } });
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(submitContact).toHaveBeenLastCalledWith({ name: 'a'.repeat(100), email: `${'a'.repeat(242)}@example.com` });

    fireEvent.change(email, { target: { value: `${'a'.repeat(243)}@example.com` } });
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByText('Email Address must be 254 characters or fewer.')).toBeInTheDocument();
  });

  it('disables while pending and signals only successful submissions', async () => {
    let resolveSubmission: (value: boolean) => void = () => undefined;
    const submitContact = vi.fn(() => new Promise<boolean>((resolve) => { resolveSubmission = resolve; }));
    const onSubmissionSuccess = vi.fn();
    render(<ContactForm onSubmissionSuccess={onSubmissionSuccess} submitContact={submitContact} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    await userEvent.type(screen.getByLabelText('Email Address'), 'ada@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByRole('button', { name: /sending message/i })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: /sending message/i }));
    expect(submitContact).toHaveBeenCalledTimes(1);
    resolveSubmission(true);
    await waitFor(() => expect(onSubmissionSuccess).toHaveBeenCalledOnce());
  });

  it.each([
    ['rejected request', () => Promise.reject(new Error('network failure'))],
    ['unsuccessful response', () => Promise.resolve(false)],
  ])('retains values and shows the generic failure for %s', async (_outcome, request) => {
    const submitContact = vi.fn(request);
    render(<ContactForm submitContact={submitContact} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    await userEvent.type(screen.getByLabelText('Email Address'), 'ada@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to submit your information. Please try again.');
    expect(screen.getByLabelText('Name')).toHaveValue('Ada');
    expect(screen.getByLabelText('Email Address')).toHaveValue('ada@example.com');
  });
});

describe('createContactSubmission', () => {
  it.each([201])('accepts only HTTP 201', async (status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })));
    await expect(createContactSubmission({ name: 'Ada', email: 'ada@example.com' })).resolves.toBe(true);
    expect(fetch).toHaveBeenCalledWith('/contact-submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ada', email: 'ada@example.com' }),
    });
    vi.unstubAllGlobals();
  });

  it.each([200, 202, 422, 500])('rejects non-201 status %i', async (status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })));
    await expect(createContactSubmission({ name: 'Ada', email: 'ada@example.com' })).resolves.toBe(false);
    vi.unstubAllGlobals();
  });

  it('maps rejected fetches to failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network failure')));
    await expect(createContactSubmission({ name: 'Ada', email: 'ada@example.com' })).resolves.toBe(false);
    vi.unstubAllGlobals();
  });

  it('maps malformed fetch outcomes to failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(null));
    await expect(createContactSubmission({ name: 'Ada', email: 'ada@example.com' })).resolves.toBe(false);
    vi.unstubAllGlobals();
  });
});
