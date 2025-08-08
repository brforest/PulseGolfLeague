import React, { useEffect, useState } from 'react';
import './index.css';
import GolfVideo from '../../../videos/golf_video.mp4';
import PglLogo from '../../../images/pgl_logo.png';

function PulseGolfLeague() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const handleScroll = () => {
    const hero = document.querySelector('.hero');
    const features = document.querySelector('.features');
    const scrolled = window.pageYOffset;

    // Hero parallax
    if (hero) {
      hero.style.backgroundPositionY = -(scrolled * 0.2) + 'px';
    }

    // Features section parallax
    const featuresBefore = features?.querySelector('::before');
    if (featuresBefore) {
      featuresBefore.style.transform = `translateY(${scrolled * 0.1}px)`;
    }

    // Scroll-triggered animation for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    const triggerPoint = window.innerHeight * 0.8;

    featureCards.forEach(card => {
      const cardTop = card.getBoundingClientRect().top;
      if (cardTop < triggerPoint) {
        card.classList.add('visible');
      }
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const video = document.querySelector('.hero-video');
    if (video) {
      const handleCanPlay = () => setIsVideoReady(true);
      video.addEventListener('canplaythrough', handleCanPlay);
      const timeout = setTimeout(() => setIsVideoReady(true), 4000); // Max 4 seconds
      return () => {
        video.removeEventListener('canplaythrough', handleCanPlay);
        clearTimeout(timeout);
      };
    } else {
      setTimeout(() => setIsVideoReady(true), 4000); // Fallback if video not found
    }
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false); // Close menu on link click
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="app-container">
      {isVideoReady ? null : (
        <div className="loader">
          <div className="loader-golf-ball"></div>
        </div>
      )}
      <header className="header">
        <div className="logo">
          <img src={PglLogo} style={{ height: "100px" }} alt="Pulse Golf League Logo" className="logo-image" />
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
            {['Home', 'Events', 'Players', 'About', 'Contact'].map(item => (
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

      <section id="home" className="hero">
        <video autoPlay muted loop playsInline className="hero-video">
          <source src={GolfVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-overlay"></div>
        <h1 className="hero-title animate-fadeIn">
          <span className="logo-highlight animate-heartbeat">Pulse</span> Golf League
        </h1>
        <p className="hero-text animate-fadeIn-slow">
          Join the revolution in professional golf.
        </p>
        <button className="cta-button">Learn More</button>
      </section>

      <section id="features" className="features">
        <h2 className="features-title animate-fadeIn">Why Pulse Golf League?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3 className="feature-card-title">Elite Competition</h3>
            <p>Top players from around the globe compete in thrilling tournaments.</p>
          </div>
          <div className="feature-card">
            <h3 className="feature-card-title">Innovative Format</h3>
            <p>Fast-paced, dynamic events designed for fans and players alike.</p>
          </div>
          <div className="feature-card">
            <h3 className="feature-card-title">Global Reach</h3>
            <p>Events hosted on iconic courses across the world.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© 2025 Pulse Golf League. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default PulseGolfLeague;