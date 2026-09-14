import { type ChangeEvent, type FormEvent, useState } from 'react'

import { createSubmission } from './contacts.api'
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

interface ContactFormProps {
  onSubmitted: () => void
}

export function ContactForm({ onSubmitted }: ContactFormProps) {
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionFailed, setSubmissionFailed] = useState(false)

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validate(values)
    setErrors(nextErrors)
    setSubmissionFailed(false)

    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    const wasCreated = await createSubmission(values)
    setIsSubmitting(false)

    if (wasCreated) {
      onSubmitted()
    } else {
      setSubmissionFailed(true)
    }
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
      {submissionFailed && <p className="submission-error" role="alert">Unable to submit your information. Please try again.</p>}
      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Sending Message...' : <>Send Message <span aria-hidden="true">↗</span></>}
      </button>
    </form>
  )
}
