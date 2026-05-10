import React, { useState, useEffect, useRef } from 'react';

const PglLogo = '/images/pgl_logo.png';
const EventPoster = '/images/yolo_fliers_matchplay_championship_poster.png';

const SQUARE_APP_ID = import.meta.env.VITE_SQUARE_APP_ID || 'sandbox-sq0idb-REPLACE_WITH_YOUR_APP_ID';
const SQUARE_LOCATION_ID = import.meta.env.VITE_SQUARE_LOCATION_ID || 'REPLACE_WITH_YOUR_LOCATION_ID';

const WAIVER_SECTIONS = [
  {
    title: 'AUTHORITY TO REGISTER AND/OR TO ACT AS AGENT',
    body: `You represent and warrant to Pulse Golf League ("PGL", "us", "we", "our") that you have full legal authority to complete this registration including full authority to make use of the credit or debit card to which registration fees will be charged. You authorize us to send instructions to the financial institution that issued your card to take payments from your card account, based on the published registration fee(s), in accordance with the terms of your agreement with us. In addition, if you are registering third parties, you represent and warrant that you have been duly authorized to act as agent on behalf of such parties in performing this registration. By proceeding with this registration, you agree that the terms of this Registration Agreement shall apply equally to you and to any third parties for whom you are acting as agent. You represent and warrant that, in compliance with the Children's Online Privacy Protection Act (COPPA), you are over thirteen (13) years of age.`,
  },
  {
    title: 'REGISTRATION POLICY',
    body: `We provide an online registration service ("Service") that allows you the convenience of registering online and authorizing a future payment of the registration fee with your credit card. Your card will be charged three (3) weeks prior to the event start date. You will receive an email confirmation at the time of registration and again when your card is charged. Your use of our website is subject to our Terms of Use, which are hereby incorporated by reference into this Agreement.`,
  },
  {
    title: 'DISCLAIMER OF WARRANTY',
    body: `YOU EXPRESSLY UNDERSTAND AND AGREE THAT: (a) YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK. THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. PULSE GOLF LEAGUE AND ITS SUPPLIERS EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. (b) PULSE GOLF LEAGUE AND ITS SUPPLIERS MAKE NO WARRANTY THAT (i) THE SERVICE WILL MEET YOUR REQUIREMENTS, (ii) THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE OR ERROR-FREE, (iii) THE RESULTS THAT MAY BE OBTAINED FROM THE USE OF THE SERVICE WILL BE ACCURATE OR RELIABLE, AND (iv) THE QUALITY OF ANY PRODUCTS, SERVICE, INFORMATION, OR OTHER MATERIAL PURCHASED OR OBTAINED BY YOU THROUGH THE SERVICE WILL MEET YOUR EXPECTATIONS. WHILE PULSE GOLF LEAGUE WILL USE REASONABLE EFFORTS TO PREVENT UNAUTHORIZED ACCESS TO DATA ENTERED BY YOU WITHIN THE SERVICE, PULSE GOLF LEAGUE AND ITS SUPPLIERS MAKE NO WARRANTY THAT SUCH DATA WILL BE SECURE AGAINST SUCH UNAUTHORIZED ACCESS OR OTHER SECURITY BREACHES.`,
  },
  {
    title: 'LIMITATION OF LIABILITY',
    body: `IN NO EVENT SHALL PULSE GOLF LEAGUE AND/OR ITS LICENSORS BE LIABLE TO ANYONE FOR ANY DIRECT, INDIRECT, PUNITIVE, SPECIAL, EXEMPLARY, INCIDENTAL, CONSEQUENTIAL OR OTHER DAMAGES OF ANY TYPE OR KIND (INCLUDING LOSS OF DATA, REVENUE, PROFITS, USE OR OTHER ECONOMIC ADVANTAGE) ARISING OUT OF, OR IN ANY WAY CONNECTED WITH THIS SERVICE, INCLUDING BUT NOT LIMITED TO THE USE OR INABILITY TO USE THE SERVICE, OR FOR ANY CONTENT OBTAINED FROM OR THROUGH THE SERVICE, EVEN IF THE PARTY FROM WHICH DAMAGES ARE BEING SOUGHT OR SUCH PARTY'S LICENSORS HAVE BEEN PREVIOUSLY ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.`,
  },
  {
    title: 'INDEMNIFICATION',
    body: `You shall indemnify and hold Pulse Golf League, its licensors and each such party's parent organizations, subsidiaries, affiliates, officers, directors, employees, attorneys and agents harmless from and against any and all claims, costs, damages, losses, liabilities and expenses (including attorneys' fees and costs) arising out of or in connection with your use of the Service.`,
  },
  {
    title: 'ASSUMPTION OF RISK & RELEASE OF LIABILITY',
    body: `Participation in golf events involves inherent physical risks including, but not limited to, injury from errant golf balls, slips and falls, and adverse weather conditions. By registering, you voluntarily assume all risks of injury, illness, property damage, or other loss that may occur in connection with your participation in any Pulse Golf League event. You hereby release, discharge, and hold harmless Pulse Golf League, Yolo Fliers Club, and their respective officers, directors, members, employees, volunteers, and agents from any and all liability, claims, demands, actions, or causes of action, whether known or unknown, arising from your participation in any PGL event.`,
  },
  {
    title: 'USE OF LIKENESS',
    body: `The Pulse Golf League arranges publicity before and during events in the press and by live and recorded radio and television broadcasting and filming and on the Internet and Social Media. Each competitor, by entering any PGL events and by agreeing to these terms and conditions, assigns to PGL and its assignees and licensees the right in perpetuity throughout the world to make, use, exhibit and reproduce in any way now known or hereafter devised (and to authorize others to do so) for commercial and other purposes, motion pictures, still pictures, live taped or filmed television, sound recordings, video, and any other reproductions of any description of the competitor made during or in connection with PGL events or promotional efforts without compensation for the competitor. The competitor also assigns the right to use and reproduce the competitor's name, voice, likeness and biographical material in any way now known or hereafter devised by PGL or its affiliates for the purpose of promoting PGL events, without compensation for the competitor.`,
  },
  {
    title: 'GENERAL PROVISIONS',
    body: `These terms shall be governed by and construed in accordance with the laws of the State of California, without giving effect to any principles of conflicts of law. You agree that any action at law or in equity arising out of or relating to these terms shall be filed only in the state or federal courts located in Sacramento County, California, and you hereby consent and submit to the personal jurisdiction of such courts for the purposes of litigating any such action. If any provision of these terms shall be unlawful, void, or for any reason unenforceable, then that provision shall be deemed severable from these terms and shall not affect the validity and enforceability of any remaining provisions. This is the entire agreement between us relating to the subject matter herein and shall not be modified except in writing, signed by both parties.`,
  },
  {
    title: 'PAYMENT AUTHORIZATION',
    body: `By providing your payment information and completing registration, you authorize Pulse Golf League to charge your card in the amount of $519.00 USD, three (3) weeks prior to the event start date (June 23, 2026). You will receive an email confirmation prior to any charge being processed. In the event of tournament cancellation by PGL, a full refund will be issued to your original payment method within 10 business days. Withdrawals made prior to the charge date will not be charged. Withdrawals made after the charge date are non-refundable unless a substitute player is found at PGL's discretion.`,
  },
];

// ===== Step 1: Tournament Details =====
function TournamentDetailsStep({ onNext }) {
  return (
    <div className="signup-step-content">
      <div className="signup-card">
        <span className="signup-event-eyebrow">INAUGURAL EVENT · YOLO FLIERS CLUB · WOODLAND, CA</span>
        <h1 className="signup-event-title">Yolo Fliers Matchplay Championship — Registration</h1>
        <div className="signup-event-dates">
          <span>QUALIFIER: MON, JULY 13</span>
          <span className="signup-date-divider">·</span>
          <span>MATCH PLAY: JULY 14–16</span>
        </div>

        <div className="signup-charge-notice signup-charge-notice-top">
          <span className="signup-charge-notice-icon">ℹ</span>
          <span>Your card will <strong>not</strong> be charged today. The $500 entry fee (+ $19 processing fee) will be charged on <strong>June 23, 2026</strong>.</span>
        </div>
        <div className="signup-actions signup-actions-top">
          <button className="signup-btn-primary" onClick={onNext}>
            Continue to Registration →
          </button>
        </div>

        <div className="signup-event-layout">
          <div className="signup-poster-wrap">
            <img
              src={EventPoster}
              alt="Yolo Fliers Matchplay Championship Poster"
              className="signup-poster"
            />
          </div>

          <div className="signup-event-info">
            <div className="signup-info-block">
              <h2 className="signup-info-title">Welcome to the Yolo Fliers Matchplay Championship!</h2>
              <p>Welcome to the inaugural event of the Pulse Golf League — The Yolo Fliers Match Play Championship! One-day, 18-hole qualifier on Monday, July 13; top 32 make it on to Single Elimination Match Play starting on Tuesday, July 14.</p>
              <p>Hosted at Yolo Fliers Club, one of the premiere private courses in the California Central Valley, and home to PGA Tour Q-School, PGA Tour Pre-Qualifiers and Monday Qualifiers, AJGA events, and more. Located in Woodland, CA, less than 30 minutes from downtown Sacramento, and even closer to the Sacramento International Airport (SMF), Yolo Fliers is easy to travel to and access.</p>
            </div>

            <div className="signup-info-block">
              <h3 className="signup-info-subtitle">About Pulse Golf League (PGL)</h3>
              <p>The Pulse Golf League (PGL) isn't just another tour; it's a movement to democratize the sport. We believe that talent should be the only barrier to entry, which is why we keep fees low and payouts high. We believe that fans shouldn't just be spectators — they should be the fuel that drives the purse. In the PGL, we don't just show you the score. We show you the pressure. Through live-streamed match play and real-time Pulse effects, we bring you inside the ropes. We capture the moments where hands shake and nerves fray. We give the power to the people to boost the purse and reward the clutch players who define the weekend.</p>

              <div className="signup-promise">
                <span className="signup-promise-heading">OUR PROMISE</span>
                <ul className="signup-promise-list">
                  <li>To the Players: A platform that respects your grind, protects your pocketbook, and celebrates your skill.</li>
                  <li>To the Fans: A raw, accessible, and thrilling experience where your voice and your Pulse Boost change the stakes of the game.</li>
                  <li>To the Game: To keep it simple, keep it competitive, and keep it fun.</li>
                </ul>
              </div>

              <p className="signup-website-ref">pulsegolfleague.com</p>
            </div>
          </div>
        </div>

        <div className="signup-charge-notice">
          <span className="signup-charge-notice-icon">ℹ</span>
          <span>Your card will <strong>not</strong> be charged today. The $500 entry fee (+ $19 processing fee) will be charged on <strong>June 23, 2026</strong>.</span>
        </div>

        <div className="signup-actions">
          <button className="signup-btn-primary" onClick={onNext}>
            Continue to Registration →
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Step 2: Waiver =====
function WaiverStep({ onNext, onBack }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="signup-step-content">
      <div className="signup-card">
        <h2 className="signup-card-title">Registration Agreement & Waiver</h2>
        <p className="signup-card-subtitle">
          Please read the following agreement carefully. You must agree to all terms to complete your registration.
        </p>

        <div className="signup-waiver-scroll">
          {WAIVER_SECTIONS.map((section, i) => (
            <div key={i} className="signup-waiver-section">
              <h4 className="signup-waiver-heading">{section.title}</h4>
              <p className="signup-waiver-body">{section.body}</p>
            </div>
          ))}
          <p className="signup-waiver-copyright">© 2026 Pulse Golf League. All Rights Reserved.</p>
        </div>

        <label className="signup-agree-label">
          <input
            type="checkbox"
            className="signup-agree-checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>
            I have read and agree to the Registration Agreement and Waiver above, including the assumption of risk, release of liability, and payment authorization provisions.
          </span>
        </label>

        <div className="signup-actions">
          <button className="signup-btn-secondary" onClick={onBack}>← Back</button>
          <button
            className="signup-btn-primary"
            onClick={onNext}
            disabled={!agreed}
          >
            I Agree — Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Step 3: Player Info =====
function PlayerInfoField({ name, label, placeholder, optional, type, options, data, errors, onChange }) {
  return (
    <div className="signup-field" data-field={name}>
      <label className="signup-field-label">
        {label}
        {!optional && <span className="signup-required"> *</span>}
        {optional && <span className="signup-optional"> (optional)</span>}
      </label>
      {type === 'select' ? (
        <select
          className={`signup-input${errors[name] ? ' error' : ''}`}
          value={data[name]}
          onChange={(e) => onChange(name, e.target.value)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input
          className={`signup-input${errors[name] ? ' error' : ''}`}
          type={type || 'text'}
          placeholder={placeholder}
          value={data[name]}
          onChange={(e) => onChange(name, e.target.value)}
          autoComplete="off"
        />
      )}
      {errors[name] && <span className="signup-field-error">{errors[name]}</span>}
    </div>
  );
}

function PlayerInfoStep({ data, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!data.firstName.trim()) errs.firstName = 'Required';
    if (!data.lastName.trim()) errs.lastName = 'Required';
    if (!data.address.trim()) errs.address = 'Required';
    if (!data.city.trim()) errs.city = 'Required';
    if (!data.state.trim()) errs.state = 'Required';
    if (!data.zip.trim()) errs.zip = 'Required';
    if (!data.country.trim()) errs.country = 'Required';
    if (!data.nationality.trim()) errs.nationality = 'Required';
    if (!data.email.trim()) {
      errs.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errs.email = 'Invalid email address';
    }
    if (!data.phone.trim()) errs.phone = 'Required';
    if (!data.homeTown.trim()) errs.homeTown = 'Required';
    if (!data.homeCourse.trim()) errs.homeCourse = 'Required';
    if (data.playingStatus === 'Amateur' && !data.ghinNumber.trim()) {
      errs.ghinNumber = 'Required for amateur players';
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) onNext();
    else {
      const firstErrKey = Object.keys(errs)[0];
      document.querySelector(`[data-field="${firstErrKey}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const f = (name, label, placeholder, optional, type, options) => (
    <PlayerInfoField
      name={name} label={label} placeholder={placeholder}
      optional={optional} type={type} options={options}
      data={data} errors={errors} onChange={onChange}
    />
  );

  return (
    <div className="signup-step-content">
      <div className="signup-card">
        <h2 className="signup-card-title">Player Information</h2>
        <p className="signup-card-subtitle">
          Fields marked <span className="signup-required">*</span> are required.
        </p>

        <div className="signup-form">
          <div className="signup-form-section">
            <h3 className="signup-form-section-title">Personal Details</h3>
            <div className="signup-field-row">
              {f('firstName', 'First Name', 'John')}
              {f('lastName', 'Last Name', 'Smith')}
            </div>
            {f('nickname', 'Nickname', 'Smitty', true)}
            <div className="signup-field-row">
              {f('homeTown', 'Home Town', 'Sacramento, CA')}
              {f('nationality', 'Nationality', 'American')}
            </div>
          </div>

          <div className="signup-form-section">
            <h3 className="signup-form-section-title">Contact Information</h3>
            {f('address', 'Street Address', '123 Main Street')}
            <div className="signup-field-row">
              {f('city', 'City', 'Sacramento')}
              {f('state', 'State / Province', 'CA')}
            </div>
            <div className="signup-field-row">
              {f('zip', 'ZIP / Postal Code', '95814')}
              {f('country', 'Country', 'United States')}
            </div>
            <div className="signup-field-row">
              {f('email', 'Email Address', 'john@example.com', false, 'email')}
              {f('phone', 'Phone Number', '+1 (555) 000-0000', false, 'tel')}
            </div>
          </div>

          <div className="signup-form-section">
            <h3 className="signup-form-section-title">Golf Details</h3>
            {f('playingStatus', 'Playing Status', undefined, false, 'select', [
              { value: 'Amateur', label: 'Amateur' },
              { value: 'Professional', label: 'Professional' },
            ])}
            {data.playingStatus === 'Amateur' &&
              f('ghinNumber', 'GHIN Number', 'e.g. 1234567')}
            <div className="signup-field-row">
              {f('homeCourse', 'Home Course', 'Your Club or Public Course')}
              {f('college', 'College / University', 'e.g. Cal Poly', true)}
            </div>
          </div>

          <div className="signup-form-section">
            <h3 className="signup-form-section-title">
              Social Media <span className="signup-section-optional">(optional)</span>
            </h3>
            <div className="signup-field-row">
              {f('instagram', 'Instagram', '@handle', true)}
              {f('twitter', 'X / Twitter', '@handle', true)}
            </div>
            {f('tiktok', 'TikTok', '@handle', true)}
          </div>
        </div>

        <div className="signup-actions">
          <button className="signup-btn-secondary" onClick={onBack}>← Back</button>
          <button className="signup-btn-primary" onClick={handleNext}>
            Continue to Payment →
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Step 4: Payment =====
function PaymentStep({ cardContainerRef, paymentError, submitting, onSubmit, onBack, playerInfo }) {
  return (
    <div className="signup-step-content">
      <div className="signup-card">
        <h2 className="signup-card-title">Payment Information</h2>
        <p className="signup-card-subtitle">
          Your card will <strong>not</strong> be charged today. A total of{' '}
          <strong>$519.00</strong> will be charged on <strong>June 23, 2026</strong>.
        </p>

        <div className="signup-payment-summary">
          <div className="signup-payment-row">
            <span>Yolo Fliers Matchplay Championship — Entry Fee</span>
            <span>$500.00</span>
          </div>
          <div className="signup-payment-row">
            <span>Processing Fee</span>
            <span>$19.00</span>
          </div>
          <div className="signup-payment-row signup-payment-row-total">
            <span>Total</span>
            <span>$519.00</span>
          </div>
          <div className="signup-payment-row signup-payment-row-charge">
            <span>Charge Date</span>
            <span>June 23, 2026</span>
          </div>
        </div>

        <div className="signup-square-wrap">
          <label className="signup-field-label">
            Card Details <span className="signup-required">*</span>
          </label>
          <div id="card-container" ref={cardContainerRef} className="signup-square-container" />
          <p className="signup-square-note">
            Payments are processed securely by Square. PGL does not store your full card number.
          </p>
        </div>

        {paymentError && (
          <div className="signup-payment-error" role="alert">{paymentError}</div>
        )}

        <div className="signup-review">
          <h4 className="signup-review-title">Registration Summary</h4>
          <div className="signup-review-grid">
            <span className="signup-review-label">Name</span>
            <span>{playerInfo.firstName} {playerInfo.lastName}</span>
            <span className="signup-review-label">Email</span>
            <span>{playerInfo.email}</span>
            <span className="signup-review-label">Playing Status</span>
            <span>{playerInfo.playingStatus}</span>
            <span className="signup-review-label">Home Course</span>
            <span>{playerInfo.homeCourse}</span>
            {playerInfo.homeTown && (
              <>
                <span className="signup-review-label">Home Town</span>
                <span>{playerInfo.homeTown}</span>
              </>
            )}
          </div>
        </div>

        <div className="signup-actions">
          <button className="signup-btn-secondary" onClick={onBack} disabled={submitting}>
            ← Back
          </button>
          <button
            className="signup-btn-primary signup-btn-submit"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? 'Processing...' : 'Complete Registration'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Confirmation =====
function ConfirmationPage({ playerInfo, onBack }) {
  return (
    <div className="signup-step-content">
      <div className="signup-card signup-confirmation">
        <div className="signup-confirm-icon">✓</div>
        <h2 className="signup-confirm-title">You're Registered!</h2>
        <p className="signup-confirm-sub">
          Welcome to the field, {playerInfo.firstName}. We'll see you at Yolo Fliers.
        </p>

        <div className="signup-confirm-details">
          <div className="signup-confirm-item">
            <span className="signup-confirm-label">CONFIRMATION SENT TO</span>
            <span className="signup-confirm-value">{playerInfo.email}</span>
          </div>
          <div className="signup-confirm-item">
            <span className="signup-confirm-label">EVENT</span>
            <span className="signup-confirm-value">Yolo Fliers Matchplay Championship</span>
          </div>
          <div className="signup-confirm-item">
            <span className="signup-confirm-label">QUALIFIER</span>
            <span className="signup-confirm-value">Monday, July 13, 2026</span>
          </div>
          <div className="signup-confirm-item">
            <span className="signup-confirm-label">MATCH PLAY</span>
            <span className="signup-confirm-value">July 14–16, 2026</span>
          </div>
          <div className="signup-confirm-item">
            <span className="signup-confirm-label">VENUE</span>
            <span className="signup-confirm-value">Yolo Fliers Club — Woodland, CA</span>
          </div>
          <div className="signup-confirm-item">
            <span className="signup-confirm-label">PAYMENT</span>
            <span className="signup-confirm-value">$519.00 to be charged on June 23, 2026</span>
          </div>
        </div>

        <p className="signup-confirm-note">
          Look out for a confirmation email with full event details. Questions?{' '}
          <a href="mailto:info@pulsegolfleague.com">info@pulsegolfleague.com</a>
        </p>

        <button className="signup-btn-primary" onClick={onBack}>
          ← Back to Info
        </button>
      </div>
    </div>
  );
}

// ===== Progress Indicator =====
function ProgressIndicator({ step, total, labels }) {
  return (
    <div className="signup-progress-bar">
      <div className="signup-progress-track">
        {labels.map((label, i) => {
          const num = i + 1;
          const done = num < step;
          const active = num === step;
          return (
            <React.Fragment key={i}>
              <div className={`signup-progress-step${active ? ' active' : ''}${done ? ' done' : ''}`}>
                <div className="signup-progress-dot">{done ? '✓' : num}</div>
                <span className="signup-progress-label">{label}</span>
              </div>
              {i < total - 1 && (
                <div className={`signup-progress-connector${done ? ' done' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ===== Main SignUp Component =====
export default function SignUp({ onBack }) {
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 4;
  const STEP_LABELS = ['Details', 'Waiver', 'Player Info', 'Payment'];

  const [playerInfo, setPlayerInfo] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    nationality: '',
    email: '',
    phone: '',
    playingStatus: 'Professional',
    ghinNumber: '',
    homeTown: '',
    homeCourse: '',
    college: '',
    instagram: '',
    twitter: '',
    tiktok: '',
  });

  const [paymentError, setPaymentError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const squareCardRef = useRef(null);
  const squarePaymentsRef = useRef(null);
  const cardContainerRef = useRef(null);

  const handlePlayerInfoChange = (field, value) => {
    setPlayerInfo((prev) => ({ ...prev, [field]: value }));
  };

  const goToStep = (s) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to top when signup page mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load Square Web Payments SDK script once
  useEffect(() => {
    const squareEnv = import.meta.env.VITE_SQUARE_ENV || 'sandbox';
    const scriptSrc =
      squareEnv === 'production'
        ? 'https://web.squarecdn.com/v1/square.js'
        : 'https://sandbox.web.squarecdn.com/v1/square.js';

    if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, []);

  // Initialize Square card when on payment step
  useEffect(() => {
    if (step !== 4) return;

    let destroyed = false;

    const initSquare = async () => {
      // Poll for Square SDK to load
      let attempts = 0;
      while (!window.Square && attempts < 40) {
        await new Promise((r) => setTimeout(r, 250));
        attempts++;
      }

      if (!window.Square) {
        if (!destroyed) setPaymentError('Payment system failed to load. Please refresh the page.');
        return;
      }

      if (destroyed) return;

      try {
        const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
        squarePaymentsRef.current = payments;

        const card = await payments.card({
          style: {
            '.input-container': {
              borderColor: 'rgba(176, 171, 152, 0.3)',
              borderRadius: '2px',
            },
            '.input-container.is-focus': {
              borderColor: '#b0ab98',
            },
            '.input-container.is-error': {
              borderColor: '#c42020',
            },
            input: {
              backgroundColor: 'transparent',
              color: '#f0ece0',
            },
            'input::placeholder': {
              color: '#706c58',
            },
            '.message-text': {
              color: '#b0ab98',
            },
            '.message-icon': {
              color: '#b0ab98',
            },
          },
        });

        if (!destroyed && cardContainerRef.current) {
          await card.attach('#card-container');
          squareCardRef.current = card;
        }
      } catch (err) {
        if (!destroyed) {
          console.error('Square init error:', err);
          setPaymentError('Failed to initialize payment form. Please try again.');
        }
      }
    };

    initSquare();

    return () => {
      destroyed = true;
      if (squareCardRef.current) {
        squareCardRef.current.destroy().catch(() => {});
        squareCardRef.current = null;
      }
    };
  }, [step, cardKey]);

  const handleSubmit = async () => {
    if (!squareCardRef.current) {
      setPaymentError('Payment form not ready. Please wait a moment and try again.');
      return;
    }

    setSubmitting(true);
    setPaymentError('');

    try {
      const result = await squareCardRef.current.tokenize();

      if (result.status === 'OK') {
        const nonce = result.token;

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        let res;
        try {
          res = await fetch(`${apiUrl}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nonce, playerInfo }),
          });
        } catch (networkErr) {
          console.error('[PGL] Network error during registration:', networkErr);
          setPaymentError('Could not reach the server. Please check your connection and try again.');
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const msg = data.error || `Registration failed (HTTP ${res.status}). Please try again.`;
          console.error('[PGL] Registration API error:', res.status, msg);
          // Nonce was consumed by the API attempt — must re-initialize the card
          // widget so the next submit generates a fresh token.
          setCardKey((k) => k + 1);
          setPaymentError(msg);
          return;
        }

        setSubmitted(true);
      } else {
        const msg =
          result.errors?.map((e) => e.message).join(' ') ||
          'Card tokenization failed. Please check your card details.';
        // tokenize() failed — nonce was not generated, no need to reset widget
        setPaymentError(msg);
      }
    } catch (err) {
      console.error('[PGL] Unexpected registration error:', err);
      setCardKey((k) => k + 1);
      setPaymentError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="signup-page">
        <header className="header">
          <div className="logo">
            <img src={PglLogo} alt="Pulse Golf League" className="logo-image" />
          </div>
        </header>
        <ConfirmationPage playerInfo={playerInfo} onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="signup-page">
      <header className="header">
        <div className="logo">
          <img src={PglLogo} alt="Pulse Golf League" className="logo-image" />
        </div>
        <button className="signup-back-btn" onClick={onBack}>
          ← Back to Info
        </button>
      </header>

      <ProgressIndicator step={step} total={TOTAL_STEPS} labels={STEP_LABELS} />

      {step === 1 && <TournamentDetailsStep onNext={() => goToStep(2)} />}
      {step === 2 && <WaiverStep onNext={() => goToStep(3)} onBack={() => goToStep(1)} />}
      {step === 3 && (
        <PlayerInfoStep
          data={playerInfo}
          onChange={handlePlayerInfoChange}
          onNext={() => goToStep(4)}
          onBack={() => goToStep(2)}
        />
      )}
      {step === 4 && (
        <PaymentStep
          cardContainerRef={cardContainerRef}
          paymentError={paymentError}
          submitting={submitting}
          onSubmit={handleSubmit}
          onBack={() => goToStep(3)}
          playerInfo={playerInfo}
        />
      )}

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
