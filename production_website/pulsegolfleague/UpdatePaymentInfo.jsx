import React, { useState, useEffect, useRef } from 'react';

const PglLogo = '/images/pgl_logo.png';
const API_BASE = import.meta.env.VITE_API_URL || '';

const SQUARE_APP_ID = import.meta.env.VITE_SQUARE_APP_ID || 'sandbox-sq0idb-REPLACE_WITH_YOUR_APP_ID';
const SQUARE_LOCATION_ID = import.meta.env.VITE_SQUARE_LOCATION_ID || 'REPLACE_WITH_YOUR_LOCATION_ID';

// ===== Step 1: Email lookup =====
function EmailLookupStep({ email, setEmail, onSubmit, loading, error }) {
  return (
    <div className="signup-step-content">
      <div className="signup-card">
        <h2 className="signup-card-title">Update Payment Card</h2>
        <p className="signup-card-subtitle">
          Enter the email address on your PGL registration to update the card on file.
        </p>

        <div className="signup-field">
          <label className="signup-field-label">
            Email Address <span className="signup-required">*</span>
          </label>
          <input
            type="email"
            className="signup-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            autoFocus
          />
        </div>

        {error && (
          <div className="signup-payment-error" role="alert">{error}</div>
        )}

        <div className="signup-actions">
          <button className="signup-btn-primary" onClick={onSubmit} disabled={loading}>
            {loading ? 'Looking up…' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Step 2: Confirm identity =====
function ConfirmIdentityStep({ firstName, lastName, email, onConfirm, onBack }) {
  return (
    <div className="signup-step-content">
      <div className="signup-card">
        <h2 className="signup-card-title">Is This You?</h2>
        <div className="signup-review">
          <div className="signup-review-grid">
            <span className="signup-review-label">Name</span>
            <span>{firstName} {lastName}</span>
            <span className="signup-review-label">Email</span>
            <span>{email}</span>
          </div>
        </div>
        <p className="signup-card-subtitle">
          If this is your registration, continue to securely enter your new card details.
        </p>
        <div className="signup-actions">
          <button className="signup-btn-secondary" onClick={onBack}>← Back</button>
          <button className="signup-btn-primary" onClick={onConfirm}>
            Continue to Card Details →
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Step 3: Card entry =====
function CardStep({ cardContainerRef, cardLoading, paymentError, submitting, onSubmit, onBack, firstName }) {
  return (
    <div className="signup-step-content">
      <div className="signup-card">
        <h2 className="signup-card-title">New Card Details</h2>
        <p className="signup-card-subtitle">
          This will replace the card currently on file for {firstName}.
        </p>

        <div className="signup-square-wrap">
          <label className="signup-field-label">
            Card Details <span className="signup-required">*</span>
          </label>
          <div className="signup-square-container-outer">
            <div id="update-card-container" ref={cardContainerRef} className="signup-square-container" />
            {cardLoading && (
              <div className="signup-square-loading" role="status" aria-live="polite">
                <span className="signup-spinner" />
                <span>Loading payment form…</span>
              </div>
            )}
          </div>
          <p className="signup-square-note">
            Payments are processed securely by Square. PGL does not store your full card number.
          </p>
        </div>

        {paymentError && (
          <div className="signup-payment-error" role="alert">{paymentError}</div>
        )}

        <div className="signup-actions">
          <button className="signup-btn-secondary" onClick={onBack} disabled={submitting}>
            ← Back
          </button>
          <button
            className="signup-btn-primary signup-btn-submit"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? 'Saving…' : 'Save New Card'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Confirmation =====
function DoneStep({ email, onBack }) {
  return (
    <div className="signup-step-content">
      <div className="signup-card signup-confirmation">
        <div className="signup-confirm-icon">✓</div>
        <h2 className="signup-confirm-title">Card Updated!</h2>
        <p className="signup-confirm-sub">
          Your new payment card has been saved on file.
        </p>
        <div className="signup-confirm-details">
          <div className="signup-confirm-item">
            <span className="signup-confirm-label">CONFIRMATION SENT TO</span>
            <span className="signup-confirm-value">{email}</span>
          </div>
        </div>
        <p className="signup-confirm-note">
          Questions? <a href="mailto:info@pulsegolfleague.com">info@pulsegolfleague.com</a>
        </p>
        <button className="signup-btn-primary" onClick={onBack}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

// ===== Main Component =====
export default function UpdatePaymentInfo({ onBack }) {
  const [step, setStep] = useState('lookup'); // lookup | confirm | card | done
  const [email, setEmail] = useState('');
  const [name, setName] = useState({ firstName: '', lastName: '' });
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cardLoading, setCardLoading] = useState(true);

  const squareCardRef = useRef(null);
  const squarePaymentsRef = useRef(null);
  const cardContainerRef = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

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

  // Initialize Square card when on the card step
  useEffect(() => {
    if (step !== 'card') return;

    let destroyed = false;
    setCardLoading(true);

    const initSquare = async () => {
      let attempts = 0;
      while (!window.Square && attempts < 40) {
        await new Promise((r) => setTimeout(r, 250));
        attempts++;
      }

      if (!window.Square) {
        if (!destroyed) {
          setPaymentError('Payment system failed to load. Please refresh the page.');
          setCardLoading(false);
        }
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
          await card.attach('#update-card-container');
          squareCardRef.current = card;
          if (!destroyed) setCardLoading(false);
        }
      } catch (err) {
        if (!destroyed) {
          console.error('Square init error:', err);
          setPaymentError('Failed to initialize payment form. Please try again.');
          setCardLoading(false);
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
  }, [step]);

  const handleLookup = async () => {
    setLookupError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLookupError('Please enter a valid email address.');
      return;
    }

    setLookupLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/update-payment/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setLookupError(data.error || 'No matching registration found.');
        return;
      }

      setName({ firstName: data.firstName, lastName: data.lastName });
      setStep('confirm');
    } catch (err) {
      console.error('[PGL] Network error during payment lookup:', err);
      setLookupError('Could not reach the server. Please check your connection and try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmitCard = async () => {
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

        let res;
        try {
          res = await fetch(`${API_BASE}/api/update-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), nonce }),
          });
        } catch (networkErr) {
          console.error('[PGL] Network error during card update:', networkErr);
          setPaymentError('Could not reach the server. Please check your connection and try again.');
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const msg = data.error || `Card update failed (HTTP ${res.status}). Please try again.`;
          console.error('[PGL] Update-payment API error:', res.status, msg);
          setPaymentError(msg);
          return;
        }

        setStep('done');
      } else {
        const msg =
          result.errors?.map((e) => e.message).join(' ') ||
          'Card tokenization failed. Please check your card details.';
        setPaymentError(msg);
      }
    } catch (err) {
      console.error('[PGL] Unexpected card update error:', err);
      setPaymentError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <header className="header">
        <div className="logo">
          <img src={PglLogo} alt="Pulse Golf League" className="logo-image" />
        </div>
        <button className="signup-back-btn" onClick={onBack}>
          ← Back to Home
        </button>
      </header>

      {step === 'lookup' && (
        <EmailLookupStep
          email={email}
          setEmail={setEmail}
          onSubmit={handleLookup}
          loading={lookupLoading}
          error={lookupError}
        />
      )}
      {step === 'confirm' && (
        <ConfirmIdentityStep
          firstName={name.firstName}
          lastName={name.lastName}
          email={email}
          onConfirm={() => setStep('card')}
          onBack={() => setStep('lookup')}
        />
      )}
      {step === 'card' && (
        <CardStep
          cardContainerRef={cardContainerRef}
          cardLoading={cardLoading}
          paymentError={paymentError}
          submitting={submitting}
          onSubmit={handleSubmitCard}
          onBack={() => setStep('confirm')}
          firstName={name.firstName}
        />
      )}
      {step === 'done' && <DoneStep email={email} onBack={onBack} />}
    </div>
  );
}
