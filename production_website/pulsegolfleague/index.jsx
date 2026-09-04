import React, { useEffect, useState, useRef } from 'react';
import './index.css';
import SignUp from './SignUp.jsx';
import TournamentInfo from './TournamentInfo.jsx';
import Admin from './AdminPanel.jsx';
import Founders from './Founders.jsx';
import Contact from './Contact.jsx';
import HostSignUp from './HostSignUp.jsx';
import HousingRequest from './HousingRequest.jsx';
import MediaCrew from './MediaCrew.jsx';
import Partnership18Birdies from './Partnership18Birdies.jsx';
import PartnershipTitleist from './PartnershipTitleist.jsx';
import UpdatePaymentInfo from './UpdatePaymentInfo.jsx';

const PglLogo = '/images/pgl_logo.png';

function TournamentBracket() {
  const SW = 120, SH = 30, HH = 50, UNIT = 40;
  const cx = [0, 160, 320, 480, 640];
  const rounds = ['R32', 'R16', 'QUARTERS', 'SEMIS', 'FINAL'];
  const dates  = ['SEP 9', 'SEP 10 AM', 'SEP 10 PM', 'SEP 11 AM', 'SEP 11 PM'];

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
          { round: 'ROUND OF 32 (GUARANTEE)', value: '$500 Pro / $350 Am' },
          { round: 'CHAMPION',                value: 'Prize Grows With The Field' },
        ].map(({ round, value }, i) => (
          <div key={i} className="purse-item">
            <span className="purse-value">{value}</span>
            <span className="purse-round">{round}</span>
          </div>
        ))}
      </div>
      <p className="purse-disclaimer">Purse beyond the guarantee is funded by entry fees and scales with the final field size — confirmed payouts announced once registration closes.</p>
    </div>
  );
}

function PulseGolfLeague() {
  const getPage = () => {
    const p = window.location.pathname;
    if (p === '/registration') return 'signup';
    if (p === '/tournament-info') return 'tournament-info';
    if (p === '/admin') return 'admin';
    if (p === '/founders') return 'founders';
    if (p === '/contact') return 'contact';
    if (p === '/host-housing') return 'host-housing';
    if (p === '/housing-request') return 'housing-request';
    if (p === '/media-crew') return 'media-crew';
    if (p === '/18birdies-partnership') return '18birdies-partnership';
    if (p === '/titleist-partnership') return 'titleist-partnership';
    if (p === '/update-payment') return 'update-payment';
    return 'home';
  };
  const [page, setPage] = useState(getPage);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [heartRate, setHeartRate] = useState(82);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'PULSE CAM', text: 'Coverage is live from Yolo Fliers GC.', tone: 'highlight' },
    { id: 2, user: 'MIA R', text: 'This format is chaos in the best way.', tone: '' },
    { id: 3, user: 'TRACKER', text: 'Pulse Boost window opens after every round.', tone: 'accent' },
    { id: 4, user: 'JULIAN K', text: 'Pressure putt incoming on 18.', tone: '' },
    { id: 5, user: 'ANNA W', text: 'That tee shot had no fear.', tone: '' },
    { id: 6, user: 'DEVIN S', text: 'Crowd is loud and locked in.', tone: 'highlight' },
  ]);
  const sectionsRef = useRef([]);
  const chatIdRef = useRef(7);
  const recentChatIndicesRef = useRef([]);

  const liveMessagePool = [
    { user: 'PULSE CAM', text: 'Leaderboard reshuffle after that birdie.', tone: 'highlight' },
    { user: 'ANNA W', text: 'That tee shot had no fear.', tone: '' },
    { user: 'TRACKER', text: 'Heart rate spikes above 120 bpm in sudden-death holes.', tone: 'accent' },
    { user: 'COACH FEED', text: 'Match play momentum swings are unreal.', tone: '' },
    { user: 'DEVIN S', text: 'Crowd is loud and locked in.', tone: 'highlight' },
    { user: 'PULSE CAM', text: 'Final group headed to the closing stretch.', tone: '' },
    { user: 'RILEY M', text: 'He is absolutely dialled in right now.', tone: '' },
    { user: 'TRACKER', text: 'Pulse Boost just hit — purse climbing.', tone: 'accent' },
    { user: 'COACH FEED', text: 'Back nine starts in 10 minutes.', tone: '' },
    { user: 'MARCUS T', text: 'That eagle on 7 changed everything.', tone: 'highlight' },
    { user: 'ANNA W', text: 'Nobody saw that chip-in coming.', tone: '' },
    { user: 'PULSE CAM', text: 'Both players tied going into 17.', tone: 'highlight' },
    { user: 'ZARA K', text: 'Heart rate must be through the roof right now.', tone: '' },
    { user: 'TRACKER', text: 'Sudden death is on the table if 18 halves.', tone: 'accent' },
    { user: 'DEVIN S', text: 'Best match I have watched all season.', tone: '' },
    { user: 'COACH FEED', text: 'Wind picking up on the back nine.', tone: '' },
    { user: 'RILEY M', text: 'Crowd on their feet at 15.', tone: 'highlight' },
    { user: 'MARCUS T', text: 'Match play pressure is different. You feel it.', tone: '' },
    { user: 'ZARA K', text: 'That concession was a smart move.', tone: '' },
    { user: 'PULSE CAM', text: 'We are heading to the 18th all square.', tone: 'highlight' },
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
  }, [page]);  // re-observe fresh DOM nodes whenever main page re-appears

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
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * liveMessagePool.length);
        } while (recentChatIndicesRef.current.includes(nextIndex));
        recentChatIndicesRef.current = [...recentChatIndicesRef.current.slice(-5), nextIndex];
        const nextMessage = liveMessagePool[nextIndex];
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

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onPopState = () => setPage(getPage());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navigate = (path, state = {}) => {
    history.pushState(state, '', path);
    setPage(getPage());
    window.scrollTo(0, 0);
  };

  if (page === 'admin') {
    return <Admin onBack={() => navigate('/')} />;
  }

  if (page === 'founders') {
    const foundersBack = history.state?.from || '/';
    return <Founders onBack={() => navigate(foundersBack)} onContact={(from) => navigate('/contact', { from: from || '/founders' })} />;
  }

  if (page === 'contact') {
    const contactBack = history.state?.from || '/';
    return <Contact onBack={() => navigate(contactBack)} />;
  }

  if (page === 'host-housing') {
    const backTo = history.state?.from || '/';
    return <HostSignUp onBack={() => navigate(backTo)} />;
  }

  if (page === 'housing-request') {
    const backTo = history.state?.from || '/tournament-info';
    return <HousingRequest onBack={() => navigate(backTo)} />;
  }

  if (page === 'media-crew') {
    const backTo = history.state?.from || '/';
    return <MediaCrew onBack={() => navigate(backTo)} />;
  }

  if (page === '18birdies-partnership') {
    const backTo = history.state?.from || '/';
    return <Partnership18Birdies onBack={() => navigate(backTo)} />;
  }

  if (page === 'titleist-partnership') {
    const backTo = history.state?.from || '/';
    return <PartnershipTitleist onBack={() => navigate(backTo)} />;
  }

  if (page === 'update-payment') {
    const backTo = history.state?.from || '/';
    return <UpdatePaymentInfo onBack={() => navigate(backTo)} />;
  }

  if (page === 'signup') {
    return <SignUp onBack={() => navigate('/tournament-info')} />;
  }

  if (page === 'tournament-info') {
    return (
      <TournamentInfo
        onRegister={() => navigate('/registration')}
        onBack={() => navigate('/')}
        onFounders={() => navigate('/founders', { from: '/tournament-info' })}
        onContact={(from) => navigate('/contact', { from: from || '/tournament-info' })}
        onHousing={(from) => navigate('/housing-request', { from: from || '/tournament-info' })}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className={`header${isScrolled ? ' scrolled' : ''}`}>
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
            {['Mission', 'Format', 'Live', 'Join'].map((item) => (
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

      {/* Hero / Mission */}
      <section id="mission" className="hero">
        <div className="section-bg hero-bg"></div>
        <div className="section-overlay"></div>
        <div className="hero-grain"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            WE'RE HERE TO<br />
            <span className="hero-title-accent">RESTART THE PULSE.</span>
          </h1>
          <p className="hero-subheading">
            Pool play or a stroke play qualifier — the format scales with the field. Championship Match Play crowns one champion. Join the Pulse Golf League for our Pilot event at Yolo Fliers GC this September. High-intensity golf, streamed live to the world.
          </p>
          <div className="hero-cta">
            <button className="hero-pilot-info-button" onClick={() => navigate('/tournament-info')}>Pilot Event Info and Sign Up</button>
            <button className="hero-founders-button" onClick={() => navigate('/founders', { from: '/' })}>Meet the Founders</button>
          </div>
          <div className="hero-cta" style={{ marginTop: 16 }}>
            <button className="hero-founders-button" onClick={() => navigate('/housing-request', { from: '/' })}>Request Host Housing (Players)</button>
            <button className="hero-founders-button" onClick={() => navigate('/host-housing', { from: '/' })}>Host a Player (Club Members)</button>
            <button className="hero-founders-button" onClick={() => navigate('/media-crew', { from: '/' })}>Join the Media Crew</button>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span>SCROLL</span>
          <div className="scroll-line"></div>
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
          A four-day pilot built for pressure. 32 players or fewer play Pool Play Match Play — 4-player pools, 54 guaranteed holes — before advancing to Championship Match Play. A field of 33+ returns to a Stroke Play Qualifier that scales from 8 to 32 Championship spots. Every match from there is head-to-head, and only one player survives to claim the title.
        </p>
        <div className="format-flow">
          <div className="format-step">
            <span className="format-number" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>POOL PLAY OR QUALIFIER</span>
            <span className="format-label">DAY 1</span>
          </div>
          <div className="format-arrow">→</div>
          <div className="format-step">
            <span className="format-number">8–32</span>
            <span className="format-label">CHAMPIONSHIP MATCH PLAY</span>
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
          <p className="live-streaming">STREAMING LIVE SEPTEMBER 2026</p>
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
              <span className="matchday-value">September 8-11</span>
            </div>
            <div className="matchday-detail">
              <span className="matchday-label">Venue</span>
              <span className="matchday-value">Yolo Fliers GC</span>
              <span className="matchday-label">Woodland, CA</span>
            </div>
            <div className="matchday-prize">
              <span className="prize-amount" style={{ fontSize: '1.9rem' }}>PRIZE GROW WITH THE FIELD</span>
              <span className="prize-label">TO THE WINNER</span>
              <span className="prize-disclaimer">Reach Championship Match Play and lose Round 1 — get your entry fee back, guaranteed</span>
            </div>
          </div>
          <div className="matchday-cta">
            <button
              className="tournament-info-button"
              onClick={() => navigate('/tournament-info')}
            >Tournament Info and Sign Up</button>
            <div className="entry-info">
              <span className="entry-fee">$350 AM / $500 PRO ENTRY</span>
              <span className="entry-note">EARN YOUR WAY IN, LOSE ROUND 1, GET IT BACK</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <span className="footer-logo" onClick={() => navigate('/admin')} style={{ cursor: 'default' }}>PGL</span>
          <p>© 2026 Pulse Golf League. All rights reserved.</p>
          <div className="footer-links">
            <a href="#mission">Mission</a>
            <a href="#format">Format</a>
            <a href="#live">Live</a>
            <a href="#join">Join</a>
            <a href="/founders" onClick={(e) => { e.preventDefault(); navigate('/founders', { from: '/' }); }}>Meet the Founders</a>
            <a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact', { from: '/' }); }}>Contact</a>
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

export default PulseGolfLeague;