import { type ChangeEvent, type FormEvent, useState } from 'react'

import type { ContactErrors, ContactField, ContactValues } from './contacts.types'

const EMPTY_VALUES: ContactValues = { name: '', email: '' }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {}

  if (values.name.length === 0) {
    errors.name = 'Name is required.'
  } else if (values.name.length > 100) {
    errors.name = 'Name must be 100 characters or fewer.'
  }

  if (values.email.length === 0) {
    errors.email = 'Email address is required.'
  } else if (values.email.length > 254) {
    errors.email = 'Email address must be 254 characters or fewer.'
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }

  return errors
}

export function ContactForm() {
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES)
  const [errors, setErrors] = useState<ContactErrors>({})

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const field = event.target.name as ContactField
    const nextValues = { ...values, [field]: event.target.value }
    setValues(nextValues)

    if (errors[field]) {
      const nextErrors = validate(nextValues)
      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]: nextErrors[field],
      }))
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors(validate(values))
  }

  return (
    <form className="contact-form" noValidate onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-invalid={Boolean(errors.name)}
          id="name"
          name="name"
          onChange={handleChange}
          placeholder="Your name"
          type="text"
          value={values.name}
        />
        {errors.name && <p className="field-error" id="name-error">{errors.name}</p>}
      </div>
      <div className="field">
        <label htmlFor="email">Email Address</label>
        <input
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={Boolean(errors.email)}
          id="email"
          name="email"
          onChange={handleChange}
          placeholder="you@example.com"
          type="email"
          value={values.email}
        />
        {errors.email && <p className="field-error" id="email-error">{errors.email}</p>}
      </div>
      <button type="submit">Send Message <span aria-hidden="true">↗</span></button>
    </form>
  )
}
