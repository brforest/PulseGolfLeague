import React, { useState, useEffect } from 'react';

const PglLogo = '/images/pgl_logo.png';
const API_BASE = import.meta.env.VITE_API_URL || '';

const DATE_OPTIONS = [
  { value: 'sep_8', label: 'September 8' },
  { value: 'sep_9', label: 'September 9' },
  { value: 'sep_10', label: 'September 10' },
  { value: 'sep_11', label: 'September 11' },
];

const ROLE_OPTIONS = [
  { value: 'camera_operator', label: 'Camera Operator' },
  { value: 'photography', label: 'Photography' },
  { value: 'livestream_broadcast', label: 'Livestream / Broadcast' },
  { value: 'social_media_bts', label: 'Social Media / BTS Video' },
  { value: 'editing', label: 'Editing' },
  { value: 'production_assistant', label: 'Production Assistant' },
];

const GOLF_KNOWLEDGE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'some', label: 'Some' },
  { value: 'golfer', label: 'Golfer' },
  { value: 'very_familiar', label: 'Very Familiar' },
];

const TRANSPORTATION_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'need_help', label: 'I need help arranging transportation' },
];

export default function MediaCrew({ onBack }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    major: '',
    yearInSchool: '',
    availableDates: [],
    rolesInterested: [],
    experience: '',
    equipment: '',
    golfKnowledge: '',
    portfolioLink: '',
    hasTransportation: '',
    whyInterested: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckboxToggle = (field, value) => {
    setForm((prev) => {
      const current = prev[field];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/media-crew`, {
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
          <span className="founders-eyebrow">STUDENTS & CREATORS</span>
          <h1 className="contact-title">Join the Pulse Golf League Media Crew</h1>
          <p className="contact-subtitle">
            Help cover a professional match-play golf tournament at Yolo Fliers Golf Club in
            Woodland, California, September 8–11. Gain hands-on experience in sports videography,
            livestream production, photography and social media while working alongside
            professional golfers and the Pulse Golf League team.
          </p>
          <div className="mc-compensation-note">
            <h2 className="mc-compensation-title">Compensation</h2>
            <p>
              This is currently an unpaid student media opportunity designed to provide hands-on
              experience in sports videography, broadcast production, photography and social
              media. If additional sponsorship funding becomes available, compensation or
              stipends may be offered, but payment cannot be guaranteed. We are also happy to
              work with students and their schools regarding internship, work-experience or
              academic-credit opportunities where applicable.
            </p>
          </div>
          <a href="mailto:info@pulsegolfleague.com" className="contact-email-link">
            info@pulsegolfleague.com
          </a>
        </div>

        <div className="contact-form-wrap">
          {status === 'success' ? (
            <div className="contact-success">
              <span className="contact-success-icon">✓</span>
              <h2>Thank you!</h2>
              <p>We've received your media crew application and will be in touch soon.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-field">
                <label htmlFor="mc-name">Name</label>
                <input
                  id="mc-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  maxLength={150}
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>
              <div className="contact-field">
                <label htmlFor="mc-email">Email</label>
                <input
                  id="mc-email"
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
                <label htmlFor="mc-phone">Phone</label>
                <input
                  id="mc-phone"
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
                <label htmlFor="mc-school">School</label>
                <input
                  id="mc-school"
                  name="school"
                  type="text"
                  maxLength={200}
                  required
                  value={form.school}
                  onChange={handleChange}
                  placeholder="Your school"
                />
              </div>
              <div className="contact-field">
                <label htmlFor="mc-major">Major / Program</label>
                <input
                  id="mc-major"
                  name="major"
                  type="text"
                  maxLength={200}
                  value={form.major}
                  onChange={handleChange}
                  placeholder="e.g. Film & Media Production"
                />
              </div>
              <div className="contact-field">
                <label htmlFor="mc-year">Year in School</label>
                <input
                  id="mc-year"
                  name="yearInSchool"
                  type="text"
                  maxLength={100}
                  value={form.yearInSchool}
                  onChange={handleChange}
                  placeholder="e.g. Junior"
                />
              </div>
              <div className="contact-field">
                <label>Which Dates Are You Available?</label>
                <div className="radio-group">
                  {DATE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="radio-option">
                      <input
                        type="checkbox"
                        checked={form.availableDates.includes(opt.value)}
                        onChange={() => handleCheckboxToggle('availableDates', opt.value)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="contact-field">
                <label>What Roles Interest You?</label>
                <div className="radio-group">
                  {ROLE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="radio-option">
                      <input
                        type="checkbox"
                        checked={form.rolesInterested.includes(opt.value)}
                        onChange={() => handleCheckboxToggle('rolesInterested', opt.value)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="contact-field">
                <label htmlFor="mc-experience">Video / Photo Experience</label>
                <textarea
                  id="mc-experience"
                  name="experience"
                  rows={3}
                  maxLength={1000}
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="Tell us about your relevant experience"
                />
              </div>
              <div className="contact-field">
                <label htmlFor="mc-equipment">Equipment You Have Experience Using</label>
                <textarea
                  id="mc-equipment"
                  name="equipment"
                  rows={3}
                  maxLength={1000}
                  value={form.equipment}
                  onChange={handleChange}
                  placeholder="Cameras, gimbals, streaming software, editing software, etc."
                />
              </div>
              <div className="contact-field">
                <label>Golf Knowledge</label>
                <div className="radio-group">
                  {GOLF_KNOWLEDGE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="radio-option">
                      <input
                        type="radio"
                        name="golfKnowledge"
                        value={opt.value}
                        checked={form.golfKnowledge === opt.value}
                        onChange={handleChange}
                        required
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="contact-field">
                <label htmlFor="mc-portfolio">Portfolio Link</label>
                <input
                  id="mc-portfolio"
                  name="portfolioLink"
                  type="text"
                  maxLength={500}
                  value={form.portfolioLink}
                  onChange={handleChange}
                  placeholder="Link to portfolio, Instagram, YouTube, reel, etc."
                />
              </div>
              <div className="contact-field">
                <label>Transportation to Yolo Fliers Golf Club?</label>
                <div className="radio-group">
                  {TRANSPORTATION_OPTIONS.map((opt) => (
                    <label key={opt.value} className="radio-option">
                      <input
                        type="radio"
                        name="hasTransportation"
                        value={opt.value}
                        checked={form.hasTransportation === opt.value}
                        onChange={handleChange}
                        required
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="contact-field">
                <label htmlFor="mc-why">Why Are You Interested in Helping with the Tournament?</label>
                <textarea
                  id="mc-why"
                  name="whyInterested"
                  rows={4}
                  maxLength={1000}
                  value={form.whyInterested}
                  onChange={handleChange}
                  placeholder="Tell us in a few sentences"
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
