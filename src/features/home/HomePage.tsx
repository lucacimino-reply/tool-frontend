import { useState, type MouseEvent } from 'react';

import { CLEAN_TYPES, LOCATIONS, ROOM_COUNTS, type CleanType, type Location, type RoomCount } from './home.types';

const REPORTS = [
  ['How to Efficiently Clean & Organize Living Areas', 'November is here, and with it comes a fresh opportunity to tackle the clutter and start the day lighter.', 'Laura Pelita', 'December 18, 2023'],
  ['How to Create a Self-Cleaning Home', 'Creating a home that practically cleans itself may sound like a dream, but with a little know-how and some...', 'Sabrina Ludowski', 'December 24, 2023'],
  ['10 Easy Ways to Turn Homekeeping Happy!', 'Homekeeping can sometimes feel like a never-ending to-do list that zaps the joy right out of your day.', 'Katrina Gomez', 'January 2, 2024'],
] as const;

function preventNavigation(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
}

export function HomePage() {
  const [location, setLocation] = useState<Location>('Studio');
  const [rooms, setRooms] = useState<RoomCount>(2);
  const [cleanType, setCleanType] = useState<CleanType>('Standard');
  const [entryMessage, setEntryMessage] = useState('');

  function restoreHome() {
    setLocation('Studio');
    setRooms(2);
    setCleanType('Standard');
    setEntryMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function beginBooking() {
    setEntryMessage(`Booking will continue with ${location}, ${rooms} rooms, and ${cleanType}.`);
  }

  return (
    <main>
      <header className="site-header">
        <button className="wordmark" type="button" onClick={restoreHome} aria-label="Clean home">
          Clean<span className="wordmark-spark">✦</span>
        </button>
        <nav aria-label="Location categories" className="location-nav">
          {LOCATIONS.map((item) => (
            <button
              className={location === item ? 'active' : ''}
              key={item}
              type="button"
              aria-pressed={location === item}
              onClick={() => setLocation(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        <button className="login-button" type="button" onClick={() => setEntryMessage('Login will be available in the next experience.')}>Login</button>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-grid" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <div className="hero-figure painter" aria-hidden="true"><span>✦</span><b /></div>
        <div className="hero-figure cleaner" aria-hidden="true"><span>✦</span><b /></div>
        <div className="hero-copy">
          <p className="eyebrow">CLEANING, WITHOUT THE FUSS</p>
          <h1 id="hero-title">Your One Stop Cleaning<br />Centre For All Needs</h1>
          <form className="booking-form" onSubmit={(event) => { event.preventDefault(); beginBooking(); }}>
            <label>
              <span className="sr-only">Number of rooms</span>
              <select aria-label="Number of rooms" value={rooms} onChange={(event) => setRooms(Number(event.target.value) as RoomCount)}>
                {ROOM_COUNTS.map((count) => <option key={count} value={count}>{count}</option>)}
              </select>
            </label>
            <span className="form-label">Rooms</span>
            <label>
              <span className="sr-only">Clean type</span>
              <select aria-label="Clean type" value={cleanType} onChange={(event) => setCleanType(event.target.value as CleanType)}>
                {CLEAN_TYPES.map((type) => <option key={type.name} value={type.name}>{type.name}</option>)}
              </select>
            </label>
            <button type="submit">Booking <span aria-hidden="true">→</span></button>
          </form>
          <p className="service-estimate" aria-live="polite">{CLEAN_TYPES.find((type) => type.name === cleanType)?.estimate}</p>
          {entryMessage && <p className="entry-message" role="status">{entryMessage}</p>}
        </div>
      </section>

      <section className="shield" aria-labelledby="shield-title">
        <div className="shield-intro">
          <h2 id="shield-title">Why Choose<br />Shield ?</h2>
          <p>We understand your home is important to you. That's why we focus on the quality of the clean. Our cleaners aren't contract workers - they are full-time employees. They care as much as we do.</p>
        </div>
        <div className="steps">
          {[
            ['▣', 'BOOK', 'Tell us when and where you want your cleaning.'],
            ['♧', 'CLEAN', 'A Professional cleaner comes over and cleans your place.'],
            ['✧', 'FREEDOM', 'Enjoy your life and come back to a clean space!.'],
          ].map(([icon, title, description]) => (
            <article className="step" key={title}>
              <div className="step-icon" aria-hidden="true">{icon}</div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="report" aria-labelledby="report-title">
        <h2 id="report-title">The Shield Report</h2>
        <div className="report-cards">
          {REPORTS.map(([title, excerpt, author, date], index) => (
            <article className={`report-card report-card-${index + 1}`} key={title}>
              <div className="report-image" aria-hidden="true"><span>{index === 0 ? '⌂' : index === 1 ? '✦' : '◒'}</span></div>
              <div className="report-content">
                <h3>{title}</h3>
                <p>{excerpt}</p>
                <footer><span className="avatar" aria-hidden="true">{author[0]}</span><span><strong>{author}</strong><small>{date}</small></span></footer>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ornament" aria-hidden="true"><span>✦</span><span>⌇</span><span>♢</span><span>✧</span><span>⌁</span><span>☼</span><span>✦</span></section>
      <footer className="site-footer">
        <div className="socials" aria-label="Social links">
          {['f', '♥', '◎', 'in'].map((social) => <a href="#" onClick={preventNavigation} key={social} aria-label={social}>{social}</a>)}
        </div>
        <div className="footer-links">
          <section><h2>Company</h2>{['About Us', 'Career', 'Press', 'Blog'].map((item) => <a href="#" onClick={preventNavigation} key={item}>{item}</a>)}</section>
          <section><h2>Services</h2>{['Residential', 'Office Cleaning', 'Commercial Cleaning'].map((item) => <a href="#" onClick={preventNavigation} key={item}>{item}</a>)}</section>
          <section><h2>Support</h2>{['Contact Us', "FAQ's"].map((item) => <a href="#" onClick={preventNavigation} key={item}>{item}</a>)}</section>
        </div>
        <div className="copyright"><strong>Clean</strong> © Clean Co. All rights reserved <span>·</span> <a href="#" onClick={preventNavigation}>Terms of Service</a> <span>·</span> <a href="#" onClick={preventNavigation}>Privacy Policy</a></div>
      </footer>
    </main>
  );
}
