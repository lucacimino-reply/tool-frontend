import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { HomePage } from '../../src/features/home/HomePage';

describe('HomePage', () => {
  it('starts with the mandated home selections and makes booking available', () => {
    render(<HomePage />);
    expect(screen.getByRole('button', { name: 'Studio' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('combobox', { name: 'Number of rooms' })).toHaveValue('2');
    expect(screen.getByRole('combobox', { name: 'Clean type' })).toHaveValue('Standard');
    expect(screen.getByRole('button', { name: /Booking/ })).toBeEnabled();
  });

  it('changes only the location through header categories', async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Number of rooms' }), '7');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Clean type' }), 'Deep Clean');
    await user.click(screen.getByRole('button', { name: 'Commercial' }));
    expect(screen.getByRole('button', { name: 'Commercial' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('combobox', { name: 'Number of rooms' })).toHaveValue('7');
    expect(screen.getByRole('combobox', { name: 'Clean type' })).toHaveValue('Deep Clean');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('offers every required room count and only the named clean types with estimates', () => {
    render(<HomePage />);
    expect(screen.getByRole('combobox', { name: 'Number of rooms' }).querySelectorAll('option')).toHaveLength(9);
    expect(screen.getByRole('combobox', { name: 'Clean type' }).querySelectorAll('option')).toHaveLength(4);
    expect(screen.getByRole('combobox', { name: 'Clean type' })).toHaveTextContent('StandardDeep CleanMoving In/OutPost Construction');
    expect(screen.getByText('Estimated 2 hours')).toBeInTheDocument();
  });

  it('restores the home defaults through the wordmark and keeps visual links inert', async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Number of rooms' }), '9');
    await user.click(screen.getByRole('button', { name: 'Clean home' }));
    expect(screen.getByRole('combobox', { name: 'Number of rooms' })).toHaveValue('2');
    const terms = screen.getByRole('link', { name: 'Terms of Service' });
    await user.click(terms);
    expect(window.location.hash).toBe('');
  });
});
