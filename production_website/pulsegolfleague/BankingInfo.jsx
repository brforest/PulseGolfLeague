import React, { useState, useEffect } from 'react';

const PglLogo = '/images/pgl_logo.png';
const API_BASE = import.meta.env.VITE_API_URL || '';

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
];

const PAYMENT_METHODS = [
  { value: 'ach', label: 'US Direct Deposit (ACH)' },
  { value: 'wire', label: 'International Wire (SWIFT)' },
];

export default function BankingInfo({ onBack }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    paymentMethod: 'ach',
    accountHolderName: '',
    bankName: '',
    accountType: '',
    routingNumber: '',
    swiftBic: '',
    bankAddress: '',
    beneficiaryAddress: '',
    bankCountry: '',
    currency: '',
    accountNumber: '',
    confirmAccountNumber: '',
    notes: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const isWire = form.paymentMethod === 'wire';

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'routingNumber') {
      setForm((prev) => ({ ...prev, [name]: value.replace(/\D/g, '') }));
      return;
    }
    if (name === 'accountNumber' || name === 'confirmAccountNumber') {
      // ACH account numbers are digits only; IBAN/wire account numbers can contain letters
      const cleaned = isWire ? value.replace(/[^A-Za-z0-9]/g, '').toUpperCase() : value.replace(/\D/g, '');
      setForm((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }
    if (name === 'swiftBic') {
      setForm((prev) => ({ ...prev, [name]: value.replace(/[^A-Za-z0-9]/g, '').toUpperCase() }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (form.accountNumber !== form.confirmAccountNumber) {
      setErrorMsg('Account number and confirmation do not match.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/api/banking-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          paymentMethod: form.paymentMethod,
          accountHolderName: form.accountHolderName,
          bankName: form.bankName,
          accountType: isWire ? undefined : form.accountType,
          routingNumber: isWire ? undefined : form.routingNumber,
          swiftBic: isWire ? form.swiftBic : undefined,
          bankAddress: isWire ? form.bankAddress : undefined,
          beneficiaryAddress: isWire ? form.beneficiaryAddress : undefined,
          bankCountry: isWire ? form.bankCountry : undefined,
          currency: isWire ? form.currency : undefined,
          accountNumber: form.accountNumber,
          notes: form.notes,
        }),
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
          <h1 className="contact-title">Direct Deposit Info</h1>
          <p className="contact-subtitle">
            Give us your bank account details so we can set you up for direct deposit
            payouts through Bluevine. Your information is encrypted and only ever used
            to process your payout — never shared or emailed.
          </p>
          <a href="mailto:info@pulsegolfleague.com" className="contact-email-link">
            info@pulsegolfleague.com
          </a>
        </div>

        <div className="contact-form-wrap">
          {status === 'success' ? (
            <div className="contact-success">
              <span className="contact-success-icon">✓</span>
              <h2>Thank you!</h2>
              <p>We've securely received your banking info and will set up your direct deposit shortly.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-field">
                <label htmlFor="bank-first-name">First Name</label>
                <input
                  id="bank-first-name"
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
                <label htmlFor="bank-last-name">Last Name</label>
                <input
                  id="bank-last-name"
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
                <label htmlFor="bank-email">Email</label>
                <input
                  id="bank-email"
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
                <label htmlFor="bank-phone">Phone</label>
                <input
                  id="bank-phone"
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
                <label>Payment Method</label>
                <div className="radio-group">
                  {PAYMENT_METHODS.map((opt) => (
                    <label key={opt.value} className="radio-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={opt.value}
                        checked={form.paymentMethod === opt.value}
                        onChange={handleChange}
                        required
                      />
                      <span><strong>{opt.label}</strong></span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="contact-field">
                <label htmlFor="bank-holder-name">Name on Bank Account</label>
                <input
                  id="bank-holder-name"
                  name="accountHolderName"
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                  required
                  value={form.accountHolderName}
                  onChange={handleChange}
                  placeholder="As it appears on your account"
                />
              </div>
              <div className="contact-field">
                <label htmlFor="bank-name">Bank Name</label>
                <input
                  id="bank-name"
                  name="bankName"
                  type="text"
                  maxLength={150}
                  required
                  value={form.bankName}
                  onChange={handleChange}
                  placeholder="e.g. Chase, Bank of America"
                />
              </div>
              {!isWire && (
                <>
                  <div className="contact-field">
                    <label>Account Type</label>
                    <div className="radio-group">
                      {ACCOUNT_TYPES.map((opt) => (
                        <label key={opt.value} className="radio-option">
                          <input
                            type="radio"
                            name="accountType"
                            value={opt.value}
                            checked={form.accountType === opt.value}
                            onChange={handleChange}
                            required
                          />
                          <span><strong>{opt.label}</strong></span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="contact-field">
                    <label htmlFor="bank-routing">Routing Number</label>
                    <input
                      id="bank-routing"
                      name="routingNumber"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={9}
                      required
                      value={form.routingNumber}
                      onChange={handleChange}
                      placeholder="9-digit routing number"
                    />
                  </div>
                </>
              )}
              {isWire && (
                <>
                  <div className="contact-field">
                    <label htmlFor="bank-swift">SWIFT/BIC Code</label>
                    <input
                      id="bank-swift"
                      name="swiftBic"
                      type="text"
                      autoComplete="off"
                      maxLength={11}
                      required
                      value={form.swiftBic}
                      onChange={handleChange}
                      placeholder="e.g. BKKBTHBK"
                    />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="bank-country">Bank Country</label>
                    <input
                      id="bank-country"
                      name="bankCountry"
                      type="text"
                      maxLength={100}
                      required
                      value={form.bankCountry}
                      onChange={handleChange}
                      placeholder="e.g. Thailand"
                    />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="bank-currency">Account Currency</label>
                    <input
                      id="bank-currency"
                      name="currency"
                      type="text"
                      maxLength={10}
                      required
                      value={form.currency}
                      onChange={handleChange}
                      placeholder="e.g. THB, USD"
                    />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="bank-address">Bank Address</label>
                    <textarea
                      id="bank-address"
                      name="bankAddress"
                      rows={2}
                      maxLength={300}
                      required
                      value={form.bankAddress}
                      onChange={handleChange}
                      placeholder="Branch address of your bank"
                    />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="bank-beneficiary-address">Your Address (Beneficiary)</label>
                    <textarea
                      id="bank-beneficiary-address"
                      name="beneficiaryAddress"
                      rows={2}
                      maxLength={300}
                      required
                      value={form.beneficiaryAddress}
                      onChange={handleChange}
                      placeholder="Your home address on file with the bank"
                    />
                  </div>
                </>
              )}
              <div className="contact-field">
                <label htmlFor="bank-account">{isWire ? 'Account Number / IBAN' : 'Account Number'}</label>
                <input
                  id="bank-account"
                  name="accountNumber"
                  type="text"
                  inputMode={isWire ? 'text' : 'numeric'}
                  autoComplete="off"
                  maxLength={isWire ? 34 : 17}
                  required
                  value={form.accountNumber}
                  onChange={handleChange}
                  placeholder={isWire ? 'Account number or IBAN' : 'Account number'}
                />
              </div>
              <div className="contact-field">
                <label htmlFor="bank-account-confirm">{isWire ? 'Confirm Account Number / IBAN' : 'Confirm Account Number'}</label>
                <input
                  id="bank-account-confirm"
                  name="confirmAccountNumber"
                  type="text"
                  inputMode={isWire ? 'text' : 'numeric'}
                  autoComplete="off"
                  maxLength={isWire ? 34 : 17}
                  required
                  value={form.confirmAccountNumber}
                  onChange={handleChange}
                  placeholder="Re-enter account number"
                />
              </div>
              <div className="contact-field">
                <label htmlFor="bank-notes">Notes (optional)</label>
                <textarea
                  id="bank-notes"
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
