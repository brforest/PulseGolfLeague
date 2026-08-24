import React, { useState, useEffect } from 'react';

const PglLogo = '/images/pgl_logo.png';
const API_BASE = import.meta.env.VITE_API_URL || '';

const DATE_OPTIONS = [
  { value: 'pgl_only', label: 'PGL Tournament Only', detail: 'September 8–11' },
  { value: 'pgl_and_qschool', label: 'PGL Tournament & PGA TOUR Q-School', detail: 'September 8–11 & September 16–18' },
];

export default function HousingRequest({ onBack }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOption: '',
    notes: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/host-housing/player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="contact-page">
      <header className="tinfo-header">
        <button className="tinfo-back-btn" onClick={onBack}>← Back</button>
        <img src={PglLogo} alt="Pulse Golf League" className="tinfo-logo" />
        <div style={{ width: 80 }} />
      </header>

      <div className="contact-body">
        <div className="contact-intro">
          <span className="founders-eyebrow">PGL PLAYERS</span>
          <h1 className="contact-title">Host Housing Request</h1>
          <p className="contact-subtitle">
            Yolo Fliers Club members have generously offered to host players during the event.
            Let us know which dates you need accommodations for, and we'll do our best to match
            you with a local host.
          </p>
          <a href="mailto:info@pulsegolfleague.com" className="contact-email-link">
            info@pulsegolfleague.com
          </a>
        </div>

        <div className="contact-form-wrap">
          {status === 'success' ? (
            <div className="contact-success">
              <span className="contact-success-icon">✓</span>
              <h2>Request received</h2>
              <p>We'll reach out as soon as we've matched you with a host.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-field">
                <label htmlFor="hr-first-name">First Name</label>
                <input
                  id="hr-first-name"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  maxLength={100}
                  required
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Your first name"
                />
              </div>
              <div className="contact-field">
                <label htmlFor="hr-last-name">Last Name</label>
                <input
                  id="hr-last-name"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  maxLength={100}
                  required
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Your last name"
                />
              </div>
              <div className="contact-field">
                <label htmlFor="hr-email">Email</label>
                <input
                  id="hr-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={200}
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>
              <div className="contact-field">
                <label htmlFor="hr-phone">Phone</label>
                <input
                  id="hr-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={30}
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="(555) 555-5555"
                />
              </div>
              <div className="contact-field">
                <label>Accommodations Needed For</label>
                <div className="radio-group">
                  {DATE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="radio-option">
                      <input
                        type="radio"
                        name="dateOption"
                        value={opt.value}
                        checked={form.dateOption === opt.value}
                        onChange={handleChange}
                        required
                      />
                      <span>
                        <strong>{opt.label}</strong>
                        <span className="radio-option-detail"> — {opt.detail}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="contact-field">
                <label htmlFor="hr-notes">Notes (optional)</label>
                <textarea
                  id="hr-notes"
                  name="notes"
                  rows={4}
                  maxLength={1000}
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Anything else we should know?"
                />
              </div>
              {status === 'error' && (
                <p className="contact-error">{errorMsg}</p>
              )}
              <button
                type="submit"
                className="contact-submit"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Submitting…' : 'Submit'}
              </button>
            </form>
          )}
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
