import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../../src/App';

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
});
