import { Router } from 'express';
import pool from '../db/index.js';
import { encryptField } from '../services/crypto.js';

export const bankingInfoRoute = Router();

// Standard mod-10 ABA routing number checksum (catches typos, not fraud)
function isValidRoutingNumber(routing) {
  if (!/^\d{9}$/.test(routing)) return false;
  const d = routing.split('').map(Number);
  const sum =
    3 * (d[0] + d[3] + d[6]) +
    7 * (d[1] + d[4] + d[7]) +
    1 * (d[2] + d[5] + d[8]);
  return sum % 10 === 0;
}

// SWIFT/BIC is 8 or 11 characters: 4 bank code letters, 2 country letters,
// 2 location alphanumeric, optional 3 branch alphanumeric
const SWIFT_RE = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

function validateBody(body) {
  const {
    firstName, lastName, email, phone,
    accountHolderName, bankName, paymentMethod,
    accountType, routingNumber,
    swiftBic, bankAddress, beneficiaryAddress, bankCountry, currency,
    accountNumber, notes,
  } = body ?? {};

  if (!firstName || typeof firstName !== 'string' || firstName.trim().length > 100) {
    return 'Please provide a first name (max 100 characters).';
  }
  if (!lastName || typeof lastName !== 'string' || lastName.trim().length > 100) {
    return 'Please provide a last name (max 100 characters).';
  }
  if (
    !email ||
    typeof email !== 'string' ||
    email.length > 200 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return 'Please provide a valid email address.';
  }
  if (!phone || typeof phone !== 'string' || phone.trim().length < 1 || phone.trim().length > 30) {
    return 'Please provide a valid phone number.';
  }
  if (!accountHolderName || typeof accountHolderName !== 'string' || accountHolderName.trim().length > 100) {
    return 'Please provide the name on the bank account (max 100 characters).';
  }
  if (!bankName || typeof bankName !== 'string' || bankName.trim().length > 150) {
    return 'Please provide your bank name (max 150 characters).';
  }
  if (!['ach', 'wire'].includes(paymentMethod)) {
    return 'Please select a valid payment method.';
  }

  if (paymentMethod === 'ach') {
    if (!['checking', 'savings'].includes(accountType)) {
      return 'Please select a valid account type.';
    }
    if (typeof routingNumber !== 'string' || !isValidRoutingNumber(routingNumber.trim())) {
      return 'Please provide a valid 9-digit routing number.';
    }
    const accountDigits = typeof accountNumber === 'string' ? accountNumber.trim() : '';
    if (!/^\d{4,17}$/.test(accountDigits)) {
      return 'Please provide a valid account number (4-17 digits).';
    }
  } else {
    if (typeof swiftBic !== 'string' || !SWIFT_RE.test(swiftBic.trim().toUpperCase())) {
      return 'Please provide a valid SWIFT/BIC code (8 or 11 characters).';
    }
    const accountValue = typeof accountNumber === 'string' ? accountNumber.trim() : '';
    if (accountValue.length < 4 || accountValue.length > 34) {
      return 'Please provide a valid account number or IBAN (4-34 characters).';
    }
    if (!bankAddress || typeof bankAddress !== 'string' || bankAddress.trim().length > 300) {
      return "Please provide your bank's address (max 300 characters).";
    }
    if (!beneficiaryAddress || typeof beneficiaryAddress !== 'string' || beneficiaryAddress.trim().length > 300) {
      return 'Please provide your (the account holder\'s) address (max 300 characters).';
    }
    if (!bankCountry || typeof bankCountry !== 'string' || bankCountry.trim().length > 100) {
      return "Please provide your bank's country (max 100 characters).";
    }
    if (!currency || typeof currency !== 'string' || currency.trim().length > 10) {
      return 'Please provide the account currency (e.g. USD, THB).';
    }
  }

  if (notes !== undefined && notes !== null && (typeof notes !== 'string' || notes.length > 1000)) {
    return 'Notes must be 1000 characters or fewer.';
  }
  return null;
}

// ── POST /api/banking-info ──────────────────────────────────────────────────
// Players submit their direct deposit (ACH) or international wire (SWIFT)
// info here so admins can set them up for payouts in Bluevine. All
// routing/account/SWIFT numbers are encrypted before storage.
bankingInfoRoute.post('/banking-info', async (req, res) => {
  const error = validateBody(req.body);
  if (error) return res.status(400).json({ error });

  const {
    firstName, lastName, email, phone,
    accountHolderName, bankName, paymentMethod,
    accountType, routingNumber,
    swiftBic, bankAddress, beneficiaryAddress, bankCountry, currency,
    accountNumber, notes,
  } = req.body;

  const accountValue = accountNumber.trim();

  try {
    const isWire = paymentMethod === 'wire';
    const routingNumberEnc = isWire ? null : encryptField(routingNumber.trim());
    const swiftBicEnc = isWire ? encryptField(swiftBic.trim().toUpperCase()) : null;
    const accountNumberEnc = encryptField(accountValue);
    const accountNumberLast4 = accountValue.slice(-4);

    await pool.query(
      `INSERT INTO banking_info_signups
         (first_name, last_name, email, phone,
          payment_method, account_holder_name, bank_name, account_type,
          routing_number_enc, account_number_enc, account_number_last4,
          swift_bic_enc, bank_address, beneficiary_address, bank_country, currency,
          notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        paymentMethod,
        accountHolderName.trim(),
        bankName.trim(),
        isWire ? null : accountType,
        routingNumberEnc,
        accountNumberEnc,
        accountNumberLast4,
        swiftBicEnc,
        isWire ? bankAddress.trim() : null,
        isWire ? beneficiaryAddress.trim() : null,
        isWire ? bankCountry.trim() : null,
        isWire ? currency.trim().toUpperCase() : null,
        notes?.trim() || null,
      ]
    );
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /banking-info error:', err);
    return res.status(500).json({ error: 'Could not save your banking info. Please try again.' });
  }
});
