import React, { useEffect, useState } from 'react';

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

export default function TournamentInfo({ onRegister, onBack }) {
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [playerError, setPlayerError] = useState('');

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
            <span>QUALIFIER: MON, JULY 13</span>
            <span className="tinfo-date-dot">·</span>
            <span>MATCH PLAY: JULY 14–16</span>
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
            <p>Welcome to the inaugural event of the Pulse Golf League — The Yolo Fliers Match Play Championship! One-day, 18-hole qualifier on Monday, July 13; top 32 make it on to Single Elimination Match Play starting on Tuesday, July 14.</p>
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
                <span className="tinfo-fact-value">Monday, July 13, 2026</span>
              </div>
              <div className="tinfo-fact">
                <span className="tinfo-fact-label">MATCH PLAY</span>
                <span className="tinfo-fact-value">July 14–16, 2026</span>
              </div>
              <div className="tinfo-fact">
                <span className="tinfo-fact-label">VENUE</span>
                <span className="tinfo-fact-value">Yolo Fliers Club — Woodland, CA</span>
              </div>
              <div className="tinfo-fact">
                <span className="tinfo-fact-label">ENTRY FEE</span>
                <span className="tinfo-fact-value">$519 · Charged ~June 23, 2026</span>
              </div>
              <div className="tinfo-fact">
                <span className="tinfo-fact-label">SIGNUP DEADLINE</span>
                <span className="tinfo-fact-value">Monday, June 29, 2026</span>
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
              <span className="tinfo-schedule-date">MON · JUL 13</span>
              <div>
                <div className="tinfo-schedule-name">18-Hole Stroke Play Qualifier</div>
                <div className="tinfo-schedule-desc">All 144 players compete. Low 32 advance to match play.</div>
              </div>
            </div>
            <div className="tinfo-schedule-item">
              <span className="tinfo-schedule-date">TUE · JUL 14</span>
              <div>
                <div className="tinfo-schedule-name">Round of 32</div>
                <div className="tinfo-schedule-desc">Single-elimination match play begins.</div>
              </div>
            </div>
            <div className="tinfo-schedule-item">
              <span className="tinfo-schedule-date">WED · JUL 15 AM</span>
              <div>
                <div className="tinfo-schedule-name">Round of 16</div>
              </div>
            </div>
            <div className="tinfo-schedule-item">
              <span className="tinfo-schedule-date">WED · JUL 15 PM</span>
              <div>
                <div className="tinfo-schedule-name">Quarterfinals</div>
              </div>
            </div>
            <div className="tinfo-schedule-item">
              <span className="tinfo-schedule-date">THU · JUL 16 AM</span>
              <div>
                <div className="tinfo-schedule-name">Semi-Finals</div>
              </div>
            </div>
            <div className="tinfo-schedule-item tinfo-schedule-final">
              <span className="tinfo-schedule-date">THU · JUL 16 PM</span>
              <div>
                <div className="tinfo-schedule-name">Final — Champion Crowned</div>
                <div className="tinfo-schedule-desc">Live-streamed to the world. $15,000* to the winner.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Player List */}
        <section className="tinfo-section tinfo-players">
          <h2 className="tinfo-section-title">
            Registered Players
            {!loadingPlayers && !playerError && (
              <span className="tinfo-player-count">{players.length} / 144</span>
            )}
          </h2>

          {loadingPlayers && <p className="tinfo-loading">Loading player list…</p>}
          {playerError && <p className="tinfo-error">{playerError}</p>}

          {!loadingPlayers && !playerError && players.length === 0 && (
            <p className="tinfo-empty">No players registered yet. Be the first!</p>
          )}

          {!loadingPlayers && !playerError && players.length > 0 && (
            <div className="tinfo-player-table-wrap">
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
          )}
        </section>

        {/* CTA */}
        <section className="tinfo-cta">
          <h2 className="tinfo-cta-title">Ready to compete?</h2>
          <p className="tinfo-cta-sub">$519 entry · Card charged ~June 23, 2026 · Top 32 earn their money back</p>
          <button className="tinfo-cta-btn" onClick={onRegister}>Sign Up Now</button>
        </section>

      </div>
    </div>
  );
}
