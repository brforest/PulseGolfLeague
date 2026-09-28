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

function validateBody(body) {
  const {
    firstName, lastName, email, phone,
    accountHolderName, bankName, accountType,
    routingNumber, accountNumber, notes,
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
  if (notes !== undefined && notes !== null && (typeof notes !== 'string' || notes.length > 1000)) {
    return 'Notes must be 1000 characters or fewer.';
  }
  return null;
}

// ── POST /api/banking-info ──────────────────────────────────────────────────
// Players submit their direct deposit info here so admins can set them up for
// payouts in Bluevine. Routing/account numbers are encrypted before storage.
bankingInfoRoute.post('/banking-info', async (req, res) => {
  const error = validateBody(req.body);
  if (error) return res.status(400).json({ error });

  const {
    firstName, lastName, email, phone,
    accountHolderName, bankName, accountType,
    routingNumber, accountNumber, notes,
  } = req.body;

  const routingDigits = routingNumber.trim();
  const accountDigits = accountNumber.trim();

  try {
    const routingNumberEnc = encryptField(routingDigits);
    const accountNumberEnc = encryptField(accountDigits);
    const accountNumberLast4 = accountDigits.slice(-4);

    await pool.query(
      `INSERT INTO banking_info_signups
         (first_name, last_name, email, phone,
          account_holder_name, bank_name, account_type,
          routing_number_enc, account_number_enc, account_number_last4, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        accountHolderName.trim(),
        bankName.trim(),
        accountType,
        routingNumberEnc,
        accountNumberEnc,
        accountNumberLast4,
        notes?.trim() || null,
      ]
    );
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /banking-info error:', err);
    return res.status(500).json({ error: 'Could not save your banking info. Please try again.' });
  }
});
