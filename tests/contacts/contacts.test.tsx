import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from '../../src/App'

describe('STUDIO contact form', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('renders the designed form and presentational navigation', () => {
    render(<App />)

    expect(screen.getByText('STUDIO')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Contact Us' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toHaveTextContent('↗')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows required errors and prevents an invalid submission from making a request', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    render(<App />)

    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(screen.getByText('Name is required.')).toBeInTheDocument()
    expect(screen.getByText('Email address is required.')).toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('validates name boundaries and clears a corrected field error', async () => {
    const user = userEvent.setup()
    render(<App />)
    const name = screen.getByLabelText('Name')

    await user.type(name, 'a'.repeat(101))
    await user.click(screen.getByRole('button', { name: /send message/i }))
    expect(screen.getByText('Name must be 100 characters or fewer.')).toBeInTheDocument()

    await user.clear(name)
    await user.type(name, 'a')
    expect(screen.queryByText('Name must be 100 characters or fewer.')).not.toBeInTheDocument()
  })

  it('rejects malformed and overlong emails while accepting valid boundary values', async () => {
    const user = userEvent.setup()
    render(<App />)
    const name = screen.getByLabelText('Name')
    const email = screen.getByLabelText('Email Address')

    await user.type(name, 'a')
    await user.type(email, 'not-an-email')
    await user.click(screen.getByRole('button', { name: /send message/i }))
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()

    await user.clear(email)
    await user.type(email, `${'a'.repeat(243)}@example.com`)
    await user.click(screen.getByRole('button', { name: /send message/i }))
    expect(screen.getByText('Email address must be 254 characters or fewer.')).toBeInTheDocument()

    await user.clear(email)
    await user.type(email, `${'a'.repeat(242)}@example.com`)
    expect(screen.queryByText('Email address must be 254 characters or fewer.')).not.toBeInTheDocument()
  })

  it('posts valid contact values once and visibly prevents concurrent requests', async () => {
    const user = userEvent.setup()
    let resolveRequest: (value: Response) => void = () => undefined
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise((resolve) => {
      resolveRequest = resolve
    }))
    render(<App />)

    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Email Address'), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(screen.getByRole('button', { name: 'Sending Message...' })).toBeDisabled()
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(fetchSpy).toHaveBeenCalledWith('/api/submissions', {
      body: JSON.stringify({ name: 'Ada Lovelace', email: 'ada@example.com' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    await user.click(screen.getByRole('button', { name: 'Sending Message...' }))
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    resolveRequest(new Response(null, { status: 201 }))
    expect(await screen.findByRole('heading', { name: 'Thank you!' })).toBeInTheDocument()
  })

  it.each([400, 500])('keeps values and shows the exact failure message for a %i response', async (status) => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status }))
    render(<App />)

    await user.type(screen.getByLabelText('Name'), 'Grace Hopper')
    await user.type(screen.getByLabelText('Email Address'), 'grace@example.com')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to submit your information. Please try again.')
    expect(screen.getByLabelText('Name')).toHaveValue('Grace Hopper')
    expect(screen.getByLabelText('Email Address')).toHaveValue('grace@example.com')
    expect(screen.queryByRole('heading', { name: 'Thank you!' })).not.toBeInTheDocument()
  })

  it('handles rejected requests and allows the same valid values to be retried', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('network unavailable'))
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
    render(<App />)

    await user.type(screen.getByLabelText('Name'), 'Lin')
    await user.type(screen.getByLabelText('Email Address'), 'lin@example.com')
    await user.click(screen.getByRole('button', { name: /send message/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /send message/i }))
    expect(await screen.findByRole('heading', { name: 'Thank you!' })).toBeInTheDocument()
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('renders confirmation and resets the form to its empty state from Back to Home', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 201 }))
    render(<App />)

    await user.type(screen.getByLabelText('Name'), 'Maya Angelou')
    await user.type(screen.getByLabelText('Email Address'), 'maya@example.com')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByText("Your information has been successfully submitted. We'll be in touch shortly.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back to Home' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back to Home' }))

    expect(screen.getByRole('heading', { name: 'Contact Us' })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('')
    expect(screen.getByLabelText('Email Address')).toHaveValue('')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByText('Name is required.')).not.toBeInTheDocument()
  })
})
