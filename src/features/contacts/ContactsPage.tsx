import { useState } from 'react'

import { ContactForm } from './ContactForm'

export function ContactsPage() {
  const [isConfirmed, setIsConfirmed] = useState(false)

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
        {isConfirmed ? (
          <section className="contact-card confirmation-card" aria-labelledby="confirmation-title">
            <div className="success-symbol" aria-hidden="true">✓</div>
            <h1 id="confirmation-title">Thank you!</h1>
            <p className="confirmation-copy">Your information has been successfully submitted. We'll be in touch shortly.</p>
            <button className="secondary-button" onClick={() => setIsConfirmed(false)} type="button">Back to Home</button>
          </section>
        ) : (
          <section className="contact-card" aria-labelledby="contact-title">
            <h1 id="contact-title">Contact Us</h1>
            <p className="intro">Have a question or want to work together? Drop us a line.</p>
            <ContactForm onSubmitted={() => setIsConfirmed(true)} />
          </section>
        )}
      </main>
    </div>
  )
}
