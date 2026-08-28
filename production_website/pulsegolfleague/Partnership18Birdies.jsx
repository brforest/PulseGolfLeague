import React, { useEffect } from 'react';

const PglLogo = '/images/pgl_logo.png';
const ONE_PAGER_URL = '/docs/PGL_18Birdies_One_Pager.pdf';

export default function Partnership18Birdies({ onBack }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    const prevTitle = document.title;
    document.title = '18Birdies x Pulse Golf League Partnership';
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
        <h1 className="partnership-title">18Birdies x Pulse Golf League Partnership</h1>

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
            We believe 18Birdies is a natural fit for the event and would love to explore a
            partnership as the <strong>Official Golf App Partner</strong> of the tournament.
          </p>

          <p>Potential integrations could include:</p>

          <ul className="partnership-list">
            <li><strong>18Birdies Match Hub</strong> — a branded event-content or match-update feature</li>
            <li><strong>18Birdies Player Insight</strong> — player stats, strategy, or course-management storytelling</li>
            <li><strong>Livestream and social integration</strong> throughout tournament coverage</li>
            <li><strong>Official Golf App Partner recognition</strong> across Pulse Golf League digital channels</li>
          </ul>

          <p>
            I'm also personally a professional golfer and an 18Birdies user, so this is a
            product I already know, use, and really like.
          </p>

          <p>
            We're flexible in how the partnership is structured and would be happy to explore a
            combination of sponsorship, promotional support, app integration, and branded
            content that aligns with 18Birdies' goals.
          </p>

          <a
            href={ONE_PAGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="partnership-cta-btn"
          >
            View Partnership One-Pager
          </a>

          <p>We'd love to discuss ideas and see if there's a fit.</p>

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
