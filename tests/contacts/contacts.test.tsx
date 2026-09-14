import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import App from '../../src/App'

describe('STUDIO contact form', () => {
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
    fetchSpy.mockRestore()
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
})
