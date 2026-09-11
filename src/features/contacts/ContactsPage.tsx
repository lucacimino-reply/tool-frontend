import { ContactForm } from './ContactForm';
import type { ContactsPageProps } from './contacts.types';

export function ContactsPage({ onSubmissionSuccess }: ContactsPageProps) {
  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="brand" aria-label="STUDIO">
          <span aria-hidden="true" className="brand-mark" />
          <span>STUDIO</span>
        </div>
        <nav aria-label="Primary navigation">
          <span>Work</span>
          <span>About</span>
          <span className="active">Contact</span>
        </nav>
      </header>
      <main>
        <section className="contact-card" aria-label="Contact us">
          <ContactForm onSubmissionSuccess={onSubmissionSuccess} />
        </section>
      </main>
    </div>
  );
}
