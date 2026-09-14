import { ContactForm } from './ContactForm'

export function ContactsPage() {
  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="brand" aria-label="STUDIO">
          <span className="brand-mark" aria-hidden="true" />
          <span>STUDIO</span>
        </div>
        <nav aria-label="Primary navigation">
          <span>Work</span>
          <span>About</span>
          <span className="current">Contact</span>
        </nav>
      </header>
      <main>
        <section className="contact-card" aria-labelledby="contact-title">
          <h1 id="contact-title">Contact Us</h1>
          <p className="intro">Have a question or want to work together? Drop us a line.</p>
          <ContactForm />
        </section>
      </main>
    </div>
  )
}
