import { ContactForm } from './ContactForm';
import { StudioFrame } from './StudioFrame';
import type { ContactsPageProps } from './contacts.types';

export function ContactsPage({ onSubmissionSuccess }: ContactsPageProps) {
  return (
    <StudioFrame>
      <section className="contact-card" aria-label="Contact us">
        <ContactForm onSubmissionSuccess={onSubmissionSuccess} />
      </section>
    </StudioFrame>
  );
}
