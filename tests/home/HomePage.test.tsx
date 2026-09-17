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

  it('accepts every required room count and exposes only the named clean types with estimates', async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    const rooms = screen.getByRole('combobox', { name: 'Number of rooms' });
    const cleanType = screen.getByRole('combobox', { name: 'Clean type' });

    expect(rooms.querySelectorAll('option')).toHaveLength(9);
    for (const roomCount of ['1', '2', '3', '4', '5', '6', '7', '8', '9']) {
      await user.selectOptions(rooms, roomCount);
      expect(rooms).toHaveValue(roomCount);
    }

    expect(cleanType.querySelectorAll('option')).toHaveLength(4);
    await user.selectOptions(cleanType, 'Standard');
    expect(screen.getByText('Estimated 2 hours')).toBeInTheDocument();
    await user.selectOptions(cleanType, 'Deep Clean');
    expect(screen.getByText('Estimated 2.5-3 hours')).toBeInTheDocument();
    await user.selectOptions(cleanType, 'Moving In/Out');
    expect(screen.getByText('Estimated 4.5-5 hours')).toBeInTheDocument();
    await user.selectOptions(cleanType, 'Post Construction');
    expect(cleanType).toHaveTextContent('StandardDeep CleanMoving In/OutPost Construction');
    expect(screen.getByText('Estimated 4.5-5 hours')).toBeInTheDocument();
  });

  it('starts Booking with the current client-side selections', async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    await user.click(screen.getByRole('button', { name: 'Residential' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Number of rooms' }), '6');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Clean type' }), 'Post Construction');
    await user.click(screen.getByRole('button', { name: /Booking/ }));

    expect(screen.getByRole('status')).toHaveTextContent('Residential, 6 rooms, and Post Construction');
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
