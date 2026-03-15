import React, { useEffect, useState, useRef } from 'react';
import './index.css';

const PglLogo = '/images/pgl_logo.png';

function PulseGolfLeague() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heartRate, setHeartRate] = useState(82);
  const sectionsRef = useRef([]);

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
            {['Manifesto', 'Season', 'Format', 'Spotlight', 'Live', 'Join'].map((item) => (
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
          <div className="hero-meta">
            <span>PGL / MANIFESTO</span>
            <span>01 / 2025</span>
          </div>
          <h1 className="hero-title">
            WE'RE HERE TO<br />
            <span className="hero-title-accent">RESTART THE PULSE.</span>
          </h1>
          <div className="hero-credits">
            <p>PULSE GOLF LEAGUE PRODUCTION PRESENTS</p>
            <p>MATCH PLAY SERIES BY PGL COMPETITION COMMITTEE</p>
            <p>PERFORMANCE ANALYSIS BY DATA & TRACKING UNIT</p>
            <p>EXECUTIVE DIRECTORS — PGL SEASON 01 BOARD</p>
          </div>
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
          <div className="intro-logo-mark">PGL</div>
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
      </section>

      {/* Player Spotlight */}
      <section id="spotlight" className="spotlight-section animate-on-scroll">
        <div className="section-bg spotlight-bg"></div>
        <div className="section-overlay"></div>
        <div className="spotlight-content">
          <div className="spotlight-header">
            <p className="spotlight-label">PLAYER SPOTLIGHT</p>
            <h2 className="spotlight-name">HOLLOWAY</h2>
          </div>
          <div className="spotlight-stats">
            <div className="stat-item">
              <span className="stat-value">312</span>
              <span className="stat-unit">YDS</span>
              <span className="stat-label">DRIVING AVG</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">68.2</span>
              <span className="stat-unit">AVG</span>
              <span className="stat-label">SCORING</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">71%</span>
              <span className="stat-unit">GIR</span>
              <span className="stat-label">GREENS IN REG</span>
            </div>
          </div>
        </div>
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
            <div className="chat-message">Come on. Drop.</div>
            <div className="chat-message">Clutch moment.</div>
            <div className="chat-message highlight">Heart rate is climbing.</div>
            <div className="chat-message">This is insane pressure.</div>
            <div className="chat-message accent">Pulse Boost incoming?</div>
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
              <span className="matchday-label">Gameweek</span>
              <span className="matchday-value">1</span>
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