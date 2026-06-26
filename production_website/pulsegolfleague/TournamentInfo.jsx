import React, { useEffect, useRef, useState } from 'react';

const PglLogo = '/images/pgl_logo.png';
const EventPoster = '/images/yolo_fliers_matchplay_championship_poster.png';

const API_URL = import.meta.env.VITE_API_URL || '';

const PURSE_ROWS = [
  { round: 'Round of 32',   value: '$500 ea.' },
  { round: 'Round of 16',   value: '$1,000 ea.*' },
  { round: 'Quarters',      value: '$2,250 ea.*' },
  { round: 'Semi-Final',    value: '$3,500 ea.*' },
  { round: 'Runner-Up',     value: '$7,000*' },
  { round: 'Champion',      value: '$15,000*' },
];

function statusLabel(status) {
  switch (status) {
    case 'Professional': return 'PRO';
    case 'Amateur':      return 'AM';
    default:             return status;
  }
}

export default function TournamentInfo({ onRegister, onBack, onFounders, onContact }) {
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [playerError, setPlayerError] = useState('');
  const [tableScrolled, setTableScrolled] = useState(false);
  const tableWrapRef = useRef(null);

  // Hide fade once user scrolls to (or near) the bottom
  useEffect(() => {
    const el = tableWrapRef.current;
    if (!el) return;
    const onScroll = () => {
      setTableScrolled(el.scrollTop + el.clientHeight >= el.scrollHeight - 8);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [players]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${API_URL}/api/players`)
      .then((r) => r.json())
      .then((data) => {
        setPlayers(data.players || []);
        setLoadingPlayers(false);
      })
      .catch(() => {
        setPlayerError('Could not load player list.');
        setLoadingPlayers(false);
      });
  }, []);

  return (
    <div className="tinfo-page">
      {/* Header */}
      <header className="tinfo-header">
        <button className="tinfo-back-btn" onClick={onBack}>← Back</button>
        <img src={PglLogo} alt="Pulse Golf League" className="tinfo-logo" />
        <button className="tinfo-register-btn-header" onClick={onRegister}>Register</button>
      </header>

      {/* Hero Banner */}
      <div className="tinfo-hero">
        <div className="tinfo-hero-overlay" />
        <div className="tinfo-hero-content">
          <span className="tinfo-eyebrow">INAUGURAL EVENT · YOLO FLIERS CLUB · WOODLAND, CA</span>
          <h1 className="tinfo-event-title">Yolo Fliers Matchplay Championship</h1>
          <div className="tinfo-dates">
            <span>QUALIFIER: TUE, SEPT 8</span>
            <span className="tinfo-date-dot">·</span>
            <span>MATCH PLAY: SEPT 9–11</span>
          </div>
        </div>
      </div>

      <div className="tinfo-body">

        {/* Overview + Poster */}
        <section className="tinfo-section tinfo-overview">
          <div className="tinfo-poster-wrap">
            <img src={EventPoster} alt="Yolo Fliers Matchplay Championship Poster" className="tinfo-poster" />
          </div>
          <div className="tinfo-overview-text">
            <h2 className="tinfo-section-title">About the Event</h2>
            <p>Welcome to the inaugural event of the Pulse Golf League — The Yolo Fliers Match Play Championship! One-day, 18-hole qualifier on Monday, September 8; top 32 make it on to Single Elimination Match Play starting on Tuesday, September 9.</p>
            <p>Hosted at Yolo Fliers Club, one of the premiere private courses in the California Central Valley, and home to PGA Tour Q-School, PGA Tour Pre-Qualifiers and Monday Qualifiers, AJGA events, and more. Located in Woodland, CA, less than 30 minutes from downtown Sacramento and even closer to Sacramento International Airport (SMF).</p>

            <div className="tinfo-key-facts">
              <div className="tinfo-fact">
                <span className="tinfo-fact-label">FORMAT</span>
                <span className="tinfo-fact-value">18-Hole Qualifier → Single Elimination Match Play</span>
              </div>
              <div className="tinfo-fact">
                <span className="tinfo-fact-label">FIELD</span>
                <span className="tinfo-fact-value">144 Qualify · Top 32 Advance</span>
              </div>
              <div className="tinfo-fact">
                <span className="tinfo-fact-label">QUALIFIER</span>
                <span className="tinfo-fact-value">Monday, September 8, 2026</span>
              </div>
              <div className="tinfo-fact">
                <span className="tinfo-fact-label">MATCH PLAY</span>
                <span className="tinfo-fact-value">September 9–11, 2026</span>
              </div>
              <div className="tinfo-fact">
                <span className="tinfo-fact-label">VENUE</span>
                <span className="tinfo-fact-value">Yolo Fliers Club — Woodland, CA</span>
              </div>
              <div className="tinfo-fact">
                <span className="tinfo-fact-label">ENTRY FEE</span>
                <span className="tinfo-fact-value">$500 · Charged August 25, 2026</span>
              </div>
              <div className="tinfo-fact">
                <span className="tinfo-fact-label">SIGNUP DEADLINE</span>
                <span className="tinfo-fact-value">Tuesday, August 25, 2026</span>
              </div>
            </div>
          </div>
        </section>

        {/* About PGL */}
        <section className="tinfo-section tinfo-about-pgl">
          <h2 className="tinfo-section-title">About Pulse Golf League</h2>
          <p>The Pulse Golf League (PGL) isn't just another tour; it's a movement to democratize the sport. We believe that talent should be the only barrier to entry, which is why we keep fees low and payouts high. We believe that fans shouldn't just be spectators — they should be the fuel that drives the purse. In the PGL, we don't just show you the score. We show you the pressure. Through live-streamed match play and real-time Pulse effects, we bring you inside the ropes.</p>

          <div className="tinfo-promise">
            <span className="tinfo-promise-heading">OUR PROMISE</span>
            <ul className="tinfo-promise-list">
              <li><strong>To the Players:</strong> A platform that respects your grind, protects your pocketbook, and celebrates your skill.</li>
              <li><strong>To the Fans:</strong> A raw, accessible, and thrilling experience where your voice and your Pulse Boost change the stakes of the game.</li>
              <li><strong>To the Game:</strong> To keep it simple, keep it competitive, and keep it fun.</li>
            </ul>
          </div>
          {onFounders && (
            <button className="tinfo-founders-inline-btn" onClick={onFounders}>Meet the Founders →</button>
          )}

        </section>

        {/* Purse Breakdown */}
        <section className="tinfo-section tinfo-purse">
          <h2 className="tinfo-section-title">Prize Purse</h2>
          <p className="tinfo-purse-subtitle">Top 32 players earn their entry fee back — and then some.</p>
          <div className="tinfo-purse-table">
            {PURSE_ROWS.map(({ round, value }) => (
              <div key={round} className={`tinfo-purse-row${round === 'Champion' ? ' tinfo-purse-champion' : ''}`}>
                <span className="tinfo-purse-round">{round}</span>
                <span className="tinfo-purse-value">{value}</span>
              </div>
            ))}
          </div>
          <p className="tinfo-purse-disclaimer">* Assuming full field of 144 players</p>
        </section>

        {/* Schedule */}
        <section className="tinfo-section tinfo-schedule">
          <h2 className="tinfo-section-title">Schedule</h2>
          <div className="tinfo-schedule-list">
            <div className="tinfo-schedule-item">
              <span className="tinfo-schedule-date">TUE · SEP 08</span>
              <div>
                <div className="tinfo-schedule-name">18-Hole Stroke Play Qualifier</div>
                <div className="tinfo-schedule-desc">All 144 players compete. Low 32 advance to match play.</div>
              </div>
            </div>
            <div className="tinfo-schedule-item">
              <span className="tinfo-schedule-date">WED · SEP 09</span>
              <div>
                <div className="tinfo-schedule-name">Round of 32</div>
                <div className="tinfo-schedule-desc">Single-elimination match play begins.</div>
              </div>
            </div>
            <div className="tinfo-schedule-item">
              <span className="tinfo-schedule-date">THU · SEP 10 AM</span>
              <div>
                <div className="tinfo-schedule-name">Round of 16</div>
              </div>
            </div>
            <div className="tinfo-schedule-item">
              <span className="tinfo-schedule-date">THU · SEP 10 PM</span>
              <div>
                <div className="tinfo-schedule-name">Quarterfinals</div>
              </div>
            </div>
            <div className="tinfo-schedule-item">
              <span className="tinfo-schedule-date">FRI · SEP 11 AM</span>
              <div>
                <div className="tinfo-schedule-name">Semi-Finals</div>
              </div>
            </div>
            <div className="tinfo-schedule-item tinfo-schedule-final">
              <span className="tinfo-schedule-date">FRI · SEP 11 PM</span>
              <div>
                <div className="tinfo-schedule-name">Final — Champion Crowned</div>
                <div className="tinfo-schedule-desc">Live-streamed to the world. $15,000* to the winner.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Player List */}
        <section className="tinfo-section tinfo-players">
          <h2 className="tinfo-section-title">Registered Players</h2>

          {!loadingPlayers && !playerError && (
            <div className="tinfo-player-stat">
              <span className="tinfo-player-stat-num">{players.length}</span>
              <span className="tinfo-player-stat-denom">/ 144</span>
              <span className="tinfo-player-stat-label">spots filled</span>
            </div>
          )}

          {loadingPlayers && <p className="tinfo-loading">Loading player list…</p>}
          {playerError && <p className="tinfo-error">{playerError}</p>}

          {!loadingPlayers && !playerError && players.length === 0 && (
            <p className="tinfo-empty">No players registered yet. Be the first!</p>
          )}

          {!loadingPlayers && !playerError && players.length > 0 && (
            <div className={`tinfo-player-table-outer${players.length > 7 && !tableScrolled ? ' tinfo-faded' : ''}`}>
              <div className="tinfo-player-table-wrap" ref={tableWrapRef}>
              <table className="tinfo-player-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Home Town</th>
                    <th>Home Course</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, i) => (
                    <tr key={p.id}>
                      <td className="tinfo-td-num">{i + 1}</td>
                      <td className="tinfo-td-name">
                        {p.firstName} {p.lastName}
                        {p.nickname && <span className="tinfo-nickname"> "{p.nickname}"</span>}
                      </td>
                      <td>
                        <span className={`tinfo-status-badge tinfo-status-${p.playingStatus.toLowerCase()}`}>
                          {statusLabel(p.playingStatus)}
                        </span>
                      </td>
                      <td>{p.homeTown}</td>
                      <td>{p.homeCourse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              {players.length > 7 && (
                <div className={`tinfo-scroll-hint${tableScrolled ? ' tinfo-scroll-hint-hidden' : ''}`}>↓ scroll for more</div>
              )}
            </div>
          )}
        </section>

        {/* Sponsors */}
        <section className="tinfo-section tinfo-sponsors">
          <h2 className="tinfo-section-title">Sponsors</h2>
          <div className="tinfo-sponsor-grid">
            <a
              href="https://fairwayhunters.net"
              target="_blank"
              rel="noopener noreferrer"
              className="tinfo-sponsor-tile"
            >
              <img
                src="/images/fairway_hunters_logo.png"
                alt="Fairway Hunters"
                className="tinfo-sponsor-logo"
              />
              <span className="tinfo-sponsor-name">Fairway Hunters</span>
            </a>
            <a
              href="https://athlesign.com"
              target="_blank"
              rel="noopener noreferrer"
              className="tinfo-sponsor-tile"
            >
              <img
                src="/images/athlesign_logo.jpg"
                alt="Athlesign"
                className="tinfo-sponsor-logo"
              />
              <span className="tinfo-sponsor-name">Athlesign</span>
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="tinfo-cta">
          <h2 className="tinfo-cta-title">Ready to compete?</h2>
          <p className="tinfo-cta-sub">$500 entry · Card not charged until August 25, 2026 · Top 32 earn their money back</p>
          <button className="tinfo-cta-btn" onClick={onRegister}>Sign Up Now</button>
        </section>

      </div>

      <footer className="footer">
        <div className="footer-content">
          <span className="footer-logo">PGL</span>
          <p>© 2026 Pulse Golf League. All rights reserved.</p>
          <div className="footer-links">
            {onFounders && (
              <button className="footer-founders-link" onClick={onFounders}>Meet the Founders</button>
            )}
            {onContact && (
              <button className="footer-founders-link" onClick={() => onContact('/tournament-info')}>Contact</button>
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
