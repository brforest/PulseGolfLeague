import React, { useEffect } from 'react';

const PglLogo = '/images/pgl_logo.png';

const FOUNDERS = [
  {
    name: 'Austin Fox',
    role: 'Co-Founder',
    hometown: 'Austin, TX',
    photo: '/images/austin_fox.webp',
    tags: ['Professional Golfer', 'Professional Caddy', 'Entrepreneur', 'Co-Founder'],
    details: [
      { label: 'Hometown', value: 'Austin, TX' },
      { label: 'College', value: 'University of the Pacific' },
      { label: 'Turned Pro', value: '2020' },
      { label: 'Current Role', value: 'Professional Golfer, Caddy, & Entrepreneur' },
    ],
    current: 'Full-time professional golfer and caddy, and part-time entrepreneur.  Austin has had extensive experience in high-level competitive golf and the golf industry as a whole, from playing to caddying to building golf-related businesses.  Austin is passionate about creating more opportunities for players and fans in this game we love.',
  },
  {
    name: 'Beau Forest',
    role: 'Co-Founder',
    hometown: 'Redding, CA',
    photo: '/images/beau_forest.webp',
    tags: ['Professional Golfer', 'Software Engineer', 'Co-Founder'],
    details: [
      { label: 'Hometown', value: 'Redding, CA' },
      { label: 'College', value: 'University of the Pacific' },
      { label: 'Turned Pro', value: '2023' },
      { label: 'Current Role', value: 'Professional Golfer & Software Engineer' },
    ],
    current: 'Full-time software engineer and professional golfer.  Beau has a unique background that combines competitive golf experience with technical expertise in software development.  He is passionate about leveraging technology to create a better experience for players and fans in the world of professional golf.',
  },
];

export default function Founders({ onBack, onContact }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="founders-page">
      <header className="tinfo-header">
        <button className="tinfo-back-btn" onClick={onBack}>← Back</button>
        <img src={PglLogo} alt="Pulse Golf League" className="tinfo-logo" />
        <div style={{ width: 80 }} />
      </header>

      <div className="founders-hero">
        <div className="founders-hero-overlay" />
        <div className="founders-hero-content">
          <span className="founders-eyebrow">THE PEOPLE BEHIND THE LEAGUE</span>
          <h1 className="founders-title">Meet the Founders</h1>
          <p className="founders-subtitle">
            Two college golf teammates from the University of the Pacific who are passionate about the professional game
            and respect those who play it. They built the Pulse Golf League to create more opportunities for players, fewer barriers to entry, more ways for fans to connect, and a more exciting golf experience for everyone.
          </p>
        </div>
      </div>

      <div className="founders-body">

        <section className="founders-origin">
          <div className="founders-origin-inner">
            <span className="founders-origin-eyebrow">WHERE IT STARTED</span>
            <h2 className="founders-origin-heading">Old college teammates with a shared vision</h2>
            <p>
              Austin Fox and Beau Forest met for the first time in 2016, when they both started playing college
              golf for the Pacific Tigers.  Both turned pro after their college careers ended. Both continued to chase the
              dream in the real world of professional golf, quickly discovering the reality of that world: high
              barriers, limited opportunities, low payouts, and not much to watch. The PGL is the culmination of years of conversations
              about creating a better professional golf experience — a league designed by players, for players, with fans at the center.
            </p>
            <p>
              Between them, Austin and Beau have played at every level of competitive golf - from junior to college to amateur, then from
              mini-tour to PGA TOUR Americas to Korn Ferry Tour to the PGA TOUR itself. They know firsthand the challenges players face
              trying to make it in this game, and they built the PGL to solve those problems.
            </p>
          </div>
        </section>

        <section className="founders-profiles">
          {FOUNDERS.map((f) => (
            <article key={f.name} className="founders-card">
              <div className="founders-card-photo-col">
                <div className="founders-photo-wrap">
                  <img src={f.photo} alt={f.name} className="founders-photo" />
                </div>
                <div className="founders-tags">
                  {f.tags.map((t) => (
                    <span key={t} className="founders-tag">{t}</span>
                  ))}
                </div>
              </div>

              <div className="founders-card-info">
                <div className="founders-name-block">
                  <h2 className="founders-name">{f.name}</h2>
                  <span className="founders-role">{f.role}</span>
                  <span className="founders-hometown">{f.hometown}</span>
                </div>

                <dl className="founders-details">
                  {f.details.map(({ label, value }) => (
                    <div key={label} className="founders-detail-row">
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="founders-current">
                  <p>{f.current}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

      </div>

      <footer className="footer">
        <div className="footer-content">
          <span className="footer-logo">PGL</span>
          <p>© 2026 Pulse Golf League. All rights reserved.</p>
          <div className="footer-links">
            {onContact && (
              <button className="footer-founders-link" onClick={() => onContact('/founders')}>Contact</button>
            )}
            <a href="https://www.instagram.com/pulsegolfleague/" target="_blank" rel="noopener noreferrer" className="footer-instagram">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              @pulsegolfleague
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
