import React, { useEffect } from 'react';

const PglLogo = '/images/pgl_logo.png';
const ONE_PAGER_URL = '/docs/PGL_Titleist_One_Pager.pdf';

export default function PartnershipTitleist({ onBack }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    const prevTitle = document.title;
    document.title = 'Titleist x Pulse Golf League Partnership';
    return () => { document.title = prevTitle; };
  }, []);

  return (
    <div className="partnership-page">
      <header className="tinfo-header">
        <button className="tinfo-back-btn" onClick={onBack}>← Back</button>
        <img src={PglLogo} alt="Pulse Golf League" className="tinfo-logo" />
        <div style={{ width: 80 }} />
      </header>

      <div className="partnership-body">
        <h1 className="partnership-title">Titleist x Pulse Golf League Partnership</h1>
        <p className="partnership-subtitle">
          A partnership opportunity built around competitive golf, trusted equipment,
          livestreaming, and player storytelling.
        </p>

        <div className="partnership-content">
          <p>
            <strong>Pulse Golf League</strong> is a new professional golf league built around
            player-first competition, transparency, livestreaming, and social storytelling.
          </p>

          <p>
            Our inaugural <strong>Yolo Fliers Matchplay Invitational</strong> will take place
            September 8–11 at Yolo Fliers Club in Woodland, California, just days before PGA
            TOUR Q-School pre-qualifying begins at the same venue.
          </p>

          <p>
            We would love to explore Titleist as the <strong>Official Golf Ball Partner</strong>{' '}
            of the event, with creative integration across the tournament, livestream, and
            social content.
          </p>

          <h2 className="partnership-section-heading">Why Titleist</h2>

          <p>
            Titleist is a particularly meaningful brand for me personally. I've been an
            all-Titleist golfer for many years, using Titleist equipment throughout my bag as
            well as Titleist golf balls.
          </p>

          <p>
            I've also participated in the Titleist player program for golf ball and glove
            support.
          </p>

          <p>
            In 2024, I had the opportunity to play in the Barracuda Championship, where I
            worked directly with the Titleist reps during tournament week. They helped me get
            set up with a new putter and 2-iron, and I was extremely grateful for the support
            and how helpful the team was throughout the process.
          </p>

          <p>
            Because of that long-standing relationship with the brand, Titleist was one of the
            first companies that came to mind when we began thinking about partners for Pulse
            Golf League.
          </p>

          <h2 className="partnership-section-heading">Potential Partnership Ideas</h2>

          <ul className="partnership-list">
            <li><strong>Official Golf Ball Partner</strong> of the Yolo Fliers Matchplay Invitational</li>
            <li><strong>Titleist Ball of the Match</strong> — highlighting a pivotal shot or moment from each match</li>
            <li>Player-focused content around <strong>golf ball selection, equipment, and preparation</strong></li>
            <li>Titleist integration across <strong>livestream graphics, social content, and event touchpoints</strong></li>
            <li>Product support, prizes, player amenities, and/or broader sponsorship support</li>
            <li>Potential to build a relationship beyond this first event into future Pulse Golf League tournaments</li>
          </ul>

          <p>
            We understand the timeline for this inaugural event is short, and we're also
            interested in exploring whether there could be a fit with Titleist for Pulse Golf
            League more broadly going forward.
          </p>

          <a
            href={ONE_PAGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="partnership-cta-btn"
          >
            View Partnership One-Pager
          </a>

          <p>We'd love the opportunity to discuss ideas and see what might make sense.</p>

          <p className="partnership-signature">
            <strong>Beau Forest</strong><br />
            Co-Founder, Pulse Golf League<br />
            pulsegolfleague.com<br />
            @pulsegolfleague
          </p>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <span className="footer-logo">PGL</span>
          <p>© 2026 Pulse Golf League. All rights reserved.</p>
          <div className="footer-links">
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
