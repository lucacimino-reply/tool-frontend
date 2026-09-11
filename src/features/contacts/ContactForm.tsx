import { type FormEvent, useState } from 'react';
import { createContactSubmission } from './contacts.api';
import type { ContactFormProps, ContactSubmissionRequest, FieldErrors } from './contacts.types';

const SUBMISSION_FAILURE = 'Unable to submit your information. Please try again.';
// This pragmatic predicate is a conventional browser-side email check, aligned to OpenAPI's email format.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(submission: ContactSubmissionRequest): FieldErrors {
  const errors: FieldErrors = {};

  if (submission.name.length === 0) {
    errors.name = 'Name is required.';
  } else if (submission.name.length > 100) {
    errors.name = 'Name must be 100 characters or fewer.';
  }

  if (submission.email.length === 0) {
    errors.email = 'Email Address is required.';
  } else if (submission.email.length > 254) {
    errors.email = 'Email Address must be 254 characters or fewer.';
  } else if (!EMAIL_PATTERN.test(submission.email)) {
    errors.email = 'Enter a valid email address.';
  }

  return errors;
}

export function ContactForm({ onSubmissionSuccess, submitContact = createContactSubmission }: ContactFormProps) {
  const [submission, setSubmission] = useState<ContactSubmissionRequest>({ name: '', email: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFailure, setSubmissionFailure] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validate(submission);
    setErrors(nextErrors);
    setSubmissionFailure(false);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    let succeeded = false;
    try {
      succeeded = await submitContact(submission);
    } catch {
      succeeded = false;
    }
    setIsSubmitting(false);

    if (succeeded) {
      onSubmissionSuccess?.();
    } else {
      setSubmissionFailure(true);
    }
  }

  return (
    <form className="contact-form" noValidate onSubmit={handleSubmit}>
      <div className="form-introduction">
        <h1>Contact Us</h1>
        <p>Have a question or want to work together? Drop us a line.</p>
      </div>

      <div className="field-group">
        <label htmlFor="name">Name</label>
        <input
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-invalid={Boolean(errors.name)}
          id="name"
          name="name"
          onChange={(event) => setSubmission({ ...submission, name: event.target.value })}
          placeholder="Your name"
          type="text"
          value={submission.name}
        />
        {errors.name && <p className="field-error" id="name-error">{errors.name}</p>}
      </div>

      <div className="field-group">
        <label htmlFor="email">Email Address</label>
        <input
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={Boolean(errors.email)}
          id="email"
          name="email"
          onChange={(event) => setSubmission({ ...submission, email: event.target.value })}
          placeholder="you@example.com"
          type="email"
          value={submission.email}
        />
        {errors.email && <p className="field-error" id="email-error">{errors.email}</p>}
      </div>

      {submissionFailure && <p className="submission-error" role="alert">{SUBMISSION_FAILURE}</p>}

      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Sending Message...' : 'Send Message'} <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
