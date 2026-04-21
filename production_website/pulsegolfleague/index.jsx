import React, { useEffect, useState, useRef } from 'react';
import './index.css';

const PglLogo = '/images/pgl_logo.png';

function TournamentBracket() {
  const SW = 120, SH = 30, HH = 50, UNIT = 40;
  const cx = [0, 160, 320, 480, 640];
  const rounds = ['R32', 'R16', 'QUARTERS', 'SEMIS', 'FINAL'];
  const dates  = ['JUL 13', 'JUL 14', 'JUL 15 AM', 'JUL 15 PM', 'JUL 16'];

  const r1y = Array.from({ length: 8 }, (_, i) => UNIT / 2 + i * UNIT);
  const r2y = Array.from({ length: 4 }, (_, i) => (r1y[i * 2] + r1y[i * 2 + 1]) / 2);
  const r3y = Array.from({ length: 2 }, (_, i) => (r2y[i * 2] + r2y[i * 2 + 1]) / 2);
  const r4y = [(r3y[0] + r3y[1]) / 2];

  const svgH = HH + 8 * UNIT + 12;
  const svgW = cx[4] + SW + 12;

  const BORDER  = 'rgba(176,171,152,0.2)';
  const MUTED   = '#706c58';
  const SEC     = '#b0ab98';
  const RED     = '#c42020';
  const SLOTBG  = 'rgba(20,26,14,0.6)';
  const CHAMPBG = 'rgba(196,32,32,0.12)';

  function BracketSlot({ x, y, label, champ }) {
    const ys = y + HH;
    return (
      <g>
        <rect
          x={x} y={ys - SH / 2} width={SW} height={SH} rx={2}
          fill={champ ? CHAMPBG : SLOTBG}
          stroke={champ ? RED : BORDER}
          strokeWidth={champ ? 1.5 : 1}
        />
        {label && (
          <text
            x={x + SW / 2} y={ys}
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="'Space Grotesk', sans-serif"
            fontSize={champ ? 8 : 7} fontWeight={champ ? '700' : '400'}
            fill={champ ? '#f0ece0' : MUTED}
            letterSpacing="2.5"
          >
            {label}
          </text>
        )}
      </g>
    );
  }

  function RoundConnectors({ fromYs, toYs, colIdx }) {
    const x1 = cx[colIdx] + SW;
    const x2 = cx[colIdx + 1];
    const mx = (x1 + x2) / 2;
    return (
      <>
        {toYs.map((ty, i) => {
          const y1 = fromYs[i * 2] + HH;
          const y2 = fromYs[i * 2 + 1] + HH;
          const my = ty + HH;
          return (
            <path key={i}
              d={`M${x1} ${y1}H${mx}V${y2}H${x1} M${mx} ${my}H${x2}`}
              fill="none" stroke={BORDER} strokeWidth="1"
            />
          );
        })}
      </>
    );
  }

  return (
    <div className="bracket-wrapper">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="bracket-svg">
        {/* Round headers */}
        {cx.map((x, i) => (
          <g key={i}>
            <text x={x + SW / 2} y={16} textAnchor="middle"
              fontFamily="'Space Grotesk', sans-serif" fontSize="7" fontWeight="600"
              fill={MUTED} letterSpacing="3"
            >{rounds[i]}</text>
            <text x={x + SW / 2} y={33} textAnchor="middle"
              fontFamily="'Space Grotesk', sans-serif" fontSize="9" fontWeight="400"
              fill={SEC} letterSpacing="1.5"
            >{dates[i]}</text>
            <line x1={x} y1={44} x2={x + SW} y2={44} stroke={BORDER} strokeWidth="0.5" />
          </g>
        ))}

        {/* Connector lines */}
        <RoundConnectors fromYs={r1y} toYs={r2y} colIdx={0} />
        <RoundConnectors fromYs={r2y} toYs={r3y} colIdx={1} />
        <RoundConnectors fromYs={r3y} toYs={r4y} colIdx={2} />
        <line x1={cx[3] + SW} y1={r4y[0] + HH} x2={cx[4]} y2={r4y[0] + HH}
          stroke={RED} strokeWidth="1.5" strokeDasharray="4 3"
        />

        {/* R32 slots */}
        {r1y.map((y, i) => (
          <BracketSlot key={`r1-${i}`} x={cx[0]} y={y}
            label={`QUALIFIER ${String(i + 1).padStart(2, '0')}`}
          />
        ))}
        {/* R16 slots */}
        {r2y.map((y, i) => <BracketSlot key={`r2-${i}`} x={cx[1]} y={y} />)}
        {/* QF slots */}
        {r3y.map((y, i) => <BracketSlot key={`r3-${i}`} x={cx[2]} y={y} />)}
        {/* SF slot */}
        <BracketSlot x={cx[3]} y={r4y[0]} />
        {/* Champion */}
        <BracketSlot x={cx[4]} y={r4y[0]} label="CHAMPION" champ />
      </svg>

      <div className="purse-strip">
        {[
          { round: 'ROUND OF 16', value: '$1,125 ea.' },
          { round: 'QUARTERS',    value: '$2,500 ea.' },
          { round: 'SEMI-FINAL',  value: '$5,000 ea.' },
          { round: 'RUNNER-UP',   value: '$10,000' },
          { round: 'CHAMPION',    value: '$15,000' },
        ].map(({ round, value }, i) => (
          <div key={i} className="purse-item">
            <span className="purse-value">{value}</span>
            <span className="purse-round">{round}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PulseGolfLeague() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heartRate, setHeartRate] = useState(82);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'PULSE CAM', text: 'Coverage is live from Yolo Fliers GC.', tone: 'highlight' },
    { id: 2, user: 'MIA R', text: 'This format is chaos in the best way.', tone: '' },
    { id: 3, user: 'TRACKER', text: 'Pulse Boost window opens after every round.', tone: 'accent' },
    { id: 4, user: 'JULIAN K', text: 'Pressure putt incoming on 18.', tone: '' },
  ]);
  const sectionsRef = useRef([]);
  const chatIdRef = useRef(5);

  const liveMessagePool = [
    { user: 'PULSE CAM', text: 'Leaderboard reshuffle after that birdie.', tone: 'highlight' },
    { user: 'ANNA W', text: 'That tee shot had no fear.', tone: '' },
    { user: 'TRACKER', text: 'Heart rate spikes above 120 bpm in sudden-death holes.', tone: 'accent' },
    { user: 'COACH FEED', text: 'Match play momentum swings are unreal.', tone: '' },
    { user: 'DEVIN S', text: 'Crowd is loud and locked in.', tone: 'highlight' },
    { user: 'PULSE CAM', text: 'Final group headed to the closing stretch.', tone: '' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.max(72, Math.min(128, prev + delta));
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const chatInterval = setInterval(() => {
      setChatMessages((prev) => {
        const nextMessage = liveMessagePool[Math.floor(Math.random() * liveMessagePool.length)];
        const message = {
          id: chatIdRef.current,
          user: nextMessage.user,
          text: nextMessage.text,
          tone: nextMessage.tone,
        };
        chatIdRef.current += 1;

        return [...prev.slice(-5), message];
      });
    }, 2600);

    return () => clearInterval(chatInterval);
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <img src={PglLogo} alt="Pulse Golf League" className="logo-image" />
        </div>
        <button
          className={`hamburger ${isMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
          <ul className="nav-list">
            {['Manifesto', 'Season', 'Format', 'Live', 'Join'].map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase()}`}
                  className="nav-link"
                  onClick={(e) => handleNavClick(e, `#${item.toLowerCase()}`)}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Hero / Manifesto */}
      <section id="manifesto" className="hero">
        <div className="section-bg hero-bg"></div>
        <div className="section-overlay"></div>
        <div className="hero-grain"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            WE'RE HERE TO<br />
            <span className="hero-title-accent">RESTART THE PULSE.</span>
          </h1>
          <p className="hero-subheading">
            144 players. 32 advance. One champion. Join the Pulse Golf League for our Pilot event at Yolo Fliers GC this July. High-intensity golf, streamed live to the world.
          </p>
          <a href="#join" className="hero-join-button" onClick={(e) => handleNavClick(e, '#join')}>
            Join Now
          </a>
        </div>
        <div className="hero-scroll-indicator">
          <span>SCROLL</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* Introducing */}
      <section className="intro-section animate-on-scroll">
        <div className="section-bg intro-bg"></div>
        <div className="section-overlay"></div>
        <div className="intro-content">
          <p className="intro-label">Introducing</p>
          <h2 className="intro-title">Pulse Golf League</h2>
          <div className="intro-copy">
            <p>Golf has a pulse, but for too long, the professional game has been flatlining.</p>
            <p>Traditional tours have built walls.<br />They've made it about high entry fees that drain a pro's bank account before they even tee off.<br />They've made it about exclusive structures and silent galleries.<br />They've forgotten that at its core, golf is about the raw, heart-pounding tension of a single putt.</p>
            <p>The Pulse Golf League (PGL) isn't just another tour; it's a movement to democratize the sport.<br />We believe that talent should be the only barrier to entry, which is why we keep fees low and payouts high.<br />We believe that fans shouldn't just be spectators - they should be the fuel that drives the purse.<br />In the PGL, we don't just show you the score. We show you the pressure.<br />Through live-streamed match play and real-time Pulse effects, we bring you inside the ropes.<br />We capture the moments where hands shake and nerves fray.<br />We give the power to the people to boost the purse and reward the clutch players who define the weekend.</p>
            <h3 className="intro-promise-title">Our Promise:</h3>
            <ul className="intro-promise-list">
              <li>To the Players: A platform that respects your grind, protects your pocketbook, and celebrates your skill.</li>
              <li>To the Fans: A raw, accessible, and thrilling experience where your voice and your Pulse Boost change the stakes of the game.</li>
              <li>To the Game: To keep it simple, keep it competitive, and keep it loud.</li>
            </ul>
            <p className="intro-closer">This is golf with a heartbeat. This is the Pulse Golf League.</p>
          </div>
        </div>
      </section>

      {/* Season Info */}
      <section id="season" className="season-section animate-on-scroll">
        <div className="section-bg season-bg"></div>
        <div className="section-overlay"></div>
        <div className="season-grid">
          <div className="season-left">
            <p className="season-label">PGL SEASON</p>
            <h2 className="season-number">01</h2>
          </div>
          <div className="season-right">
            <h3 className="season-title">MATCH PLAY<br />SERIES</h3>
            <div className="season-details">
              <div className="season-detail-item">
                <span className="detail-label">PILOT EVENT</span>
              </div>
              <div className="season-detail-item">
                <span className="detail-value">$54,000</span>
                <span className="detail-label">PURSE</span>
              </div>
              <div className="season-detail-item">
                <span className="detail-value">JULY 2026</span>
                <span className="detail-label">YOLO FLIERS GC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Match Play Format */}
      <section id="format" className="format-section animate-on-scroll">
        <div className="section-bg format-bg"></div>
        <div className="section-overlay"></div>
        <div className="format-header">
          <h2 className="format-title">MATCH PLAY<br />MADNESS</h2>
        </div>
        <p className="format-description">
          A four-day pilot built for pressure. Round of 32 starts the bracket, every match is head-to-head, and only one player survives all five rounds to claim the title.
        </p>
        <div className="format-flow">
          <div className="format-step">
            <span className="format-number">144</span>
            <span className="format-label">QUALIFY</span>
          </div>
          <div className="format-arrow">→</div>
          <div className="format-step">
            <span className="format-number">32</span>
            <span className="format-label">ADVANCE</span>
          </div>
          <div className="format-arrow">→</div>
          <div className="format-step">
            <span className="format-number">1</span>
            <span className="format-label">WINNER</span>
          </div>
        </div>
        <TournamentBracket />
      </section>

      {/* Live Experience */}
      <section id="live" className="live-section animate-on-scroll">
        <div className="section-bg live-bg"></div>
        <div className="section-overlay"></div>
        <div className="live-content">
          <div className="live-header">
            <div className="live-badge">
              <span className="live-dot"></span>
              LIVE
            </div>
            <div className="heart-rate">
              <span className="hr-value">{heartRate}</span>
              <span className="hr-unit">bpm</span>
              <span className="hr-icon">♥</span>
            </div>
          </div>
          <p className="live-streaming">STREAMING LIVE JULY 2026</p>
          <div className="live-chat">
            <div className="chat-heading">Live Chat</div>
            {chatMessages.map((message) => (
              <div key={message.id} className={`chat-message ${message.tone}`.trim()}>
                <span className="chat-user">{message.user}</span>
                <span className="chat-text">{message.text}</span>
              </div>
            ))}
            <div className="chat-typing">Fans are typing...</div>
          </div>
          <div className="live-tagline">
            <h2 className="live-title">
              DON'T JUST<br />WATCH.
            </h2>
            <h2 className="live-title-accent">FEEL IT.</h2>
          </div>
          <div className="live-features">
            <span>LIVE MATCH PLAY</span>
            <span className="separator">|</span>
            <span>HEART-RATE TRACKING</span>
            <span className="separator">|</span>
            <span>FAN-FUELED PURSES</span>
          </div>
        </div>
      </section>

      {/* Match Day */}
      <section id="join" className="matchday-section animate-on-scroll">
        <div className="section-bg matchday-bg"></div>
        <div className="section-overlay"></div>
        <div className="matchday-content">
          <div className="matchday-header">
            <h2 className="matchday-title">Match<br />Day</h2>
            <div className="matchday-badge">PGL</div>
          </div>
          <div className="matchday-info">
            <div className="matchday-detail">
              <span className="matchday-label">Match Dates</span>
              <span className="matchday-value">July 13-16</span>
            </div>
            <div className="matchday-prize">
              <span className="prize-amount">$15,000</span>
              <span className="prize-label">TO THE WINNER</span>
            </div>
          </div>
          <div className="matchday-cta">
            <button className="join-button">JOIN US</button>
            <div className="entry-info">
              <span className="entry-fee">$500 ENTRY</span>
              <span className="entry-note">TOP 32 EARN THEIR MONEY BACK</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <span className="footer-logo">PGL</span>
          <p>© 2025 Pulse Golf League. All rights reserved.</p>
          <div className="footer-links">
            <a href="#manifesto">Manifesto</a>
            <a href="#season">Season</a>
            <a href="#format">Format</a>
            <a href="#live">Live</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PulseGolfLeague;