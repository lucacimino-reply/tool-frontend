import { StudioFrame } from './StudioFrame';

interface SubmissionConfirmationProps {
  onReturnHome: () => void;
}

export function SubmissionConfirmation({ onReturnHome }: SubmissionConfirmationProps) {
  return (
    <StudioFrame>
      <section className="contact-card confirmation-card" aria-labelledby="confirmation-heading">
        <div aria-hidden="true" className="success-mark">
          <svg viewBox="0 0 32 32">
            <circle cx="16" cy="16" fill="none" r="12" stroke="currentColor" strokeWidth="2" />
            <path d="m10 16 4 4 8-9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
        <h1 id="confirmation-heading">Thank you!</h1>
        <p className="confirmation-copy">Your information has been successfully submitted. We'll be in touch shortly.</p>
        <button className="return-home" onClick={onReturnHome} type="button">Back to Home</button>
      </section>
    </StudioFrame>
  );
}
