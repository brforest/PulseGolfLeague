import { Router } from 'express';
import pool from '../db/index.js';
import { createOrFindCustomer, saveCardOnFile } from '../services/square.js';
import { sendConfirmationEmail, sendAdminAlertEmail } from '../services/email.js';

export const registerRoute = Router();

const REQUIRED_FIELDS = [
  'firstName', 'lastName', 'address', 'city', 'state', 'zip', 'country',
  'nationality', 'email', 'phone', 'playingStatus', 'homeTown', 'homeCourse',
];

const PROCESSING_FEE_CENTS = { Amateur: 1000, Professional: 1900 };
const ENTRY_FEE_CENTS = { Amateur: 35000, Professional: 50000 };

registerRoute.post('/register', async (req, res) => {
  const { nonce, playerInfo } = req.body ?? {};

  // ── Input validation ────────────────────────────────────

  if (!nonce || typeof nonce !== 'string' || nonce.length > 300) {
    return res.status(400).json({ error: 'Invalid payment token.' });
  }

  if (!playerInfo || typeof playerInfo !== 'object') {
    return res.status(400).json({ error: 'Missing player information.' });
  }

  for (const field of REQUIRED_FIELDS) {
    if (!playerInfo[field]?.trim?.()) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(playerInfo.email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  if (!['Professional', 'Amateur'].includes(playerInfo.playingStatus)) {
    return res.status(400).json({ error: 'Invalid playing status.' });
  }

  if (playerInfo.playingStatus === 'Amateur' && !playerInfo.ghinNumber?.trim()) {
    return res.status(400).json({ error: 'GHIN number is required for amateur players.' });
  }

  // ── Duplicate check ─────────────────────────────────────

  let existing;
  try {
    existing = await pool.query(
      'SELECT id FROM registrations WHERE email = $1',
      [playerInfo.email.toLowerCase().trim()]
    );
  } catch (err) {
    console.error('DB connection error during duplicate check:', err);
    sendAdminAlertEmail({
      subject: 'DB connection error during registration',
      errorType: 'Database',
      playerEmail: playerInfo.email,
      playerInfo,
      detail: err.message,
    }).catch(() => {});
    return res.status(503).json({
      error: 'Registration is temporarily unavailable. Please try again in a moment.',
    });
  }

  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'This email address is already registered.' });
  }

  // ── Square: create/find customer ────────────────────────

  let customerId;
  try {
    customerId = await createOrFindCustomer(playerInfo);
  } catch (err) {
    console.error(`Square customer error for ${playerInfo.email}:`, err);
    const firstError = err?.errors?.[0] ?? err?.body?.errors?.[0];
    // AUTHENTICATION_ERROR = bad API credentials — not the user's fault
    if (firstError?.category === 'AUTHENTICATION_ERROR') {
      sendAdminAlertEmail({
        subject: 'Square authentication error — check API credentials',
        errorType: 'Square AUTHENTICATION_ERROR (customer step)',
        playerEmail: playerInfo.email,
        playerInfo,
        detail: firstError?.detail,
        raw: err?.body,
      }).catch(() => {});
      return res.status(502).json({
        error: 'Payment system configuration error. Please contact info@pulsegolfleague.com.',
      });
    }
    sendAdminAlertEmail({
      subject: `Square customer error for ${playerInfo.email}`,
      errorType: `Square ${firstError?.category ?? 'unknown'} (customer step)`,
      playerEmail: playerInfo.email,
      playerInfo,
      detail: firstError?.detail,
      raw: err?.body,
    }).catch(() => {});
    return res.status(502).json({
      error: firstError?.detail || 'Could not set up payment profile. Please check your details and try again.',
    });
  }

  // ── Square: save card on file ───────────────────────────
  // Note: the nonce is single-use. If the DB insert below fails after this
  // succeeds, the card is already saved under the Square customer. A retry
  // by the user will hit the duplicate-email check above, so manual cleanup
  // in the Square Dashboard would be needed in that edge case.

  let cardId;
  try {
    cardId = await saveCardOnFile(nonce, customerId, playerInfo);
  } catch (err) {
    console.error(`Square card error for ${playerInfo.email}:`, err);
    const firstError = err?.errors?.[0] ?? err?.body?.errors?.[0];
    if (firstError?.category === 'AUTHENTICATION_ERROR') {
      sendAdminAlertEmail({
        subject: 'Square authentication error — check API credentials',
        errorType: 'Square AUTHENTICATION_ERROR (card step)',
        playerEmail: playerInfo.email,
        playerInfo,
        detail: firstError?.detail,
        raw: err?.body,
      }).catch(() => {});
      return res.status(502).json({
        error: 'Payment system configuration error. Please contact info@pulsegolfleague.com.',
      });
    }
    // Card errors from INVALID_REQUEST_ERROR are usually bad card data entered by user—
    // still alert so you know when someone is struggling to get through.
    sendAdminAlertEmail({
      subject: `Card save failed for ${playerInfo.email}`,
      errorType: `Square ${firstError?.category ?? 'unknown'} (card step)`,
      playerEmail: playerInfo.email,
      playerInfo,
      detail: firstError?.detail,
      raw: err?.body,
    }).catch(() => {});
    // Surface Square's own detail (e.g. "Card number is invalid", "Card declined")
    return res.status(502).json({
      error: firstError?.detail || 'Could not save payment card. Please check your card details.',
    });
  }

  // ── Persist registration ────────────────────────────────

  const chargeDate = process.env.CHARGE_DATE || '2026-08-25';
  const chargeAmountCents = (ENTRY_FEE_CENTS[playerInfo.playingStatus] ?? ENTRY_FEE_CENTS.Professional)
    + (PROCESSING_FEE_CENTS[playerInfo.playingStatus] ?? PROCESSING_FEE_CENTS.Professional);

  try {
    await pool.query(
      `INSERT INTO registrations (
         first_name, last_name, nickname,
         address, city, state, zip, country,
         nationality, email, phone,
         playing_status, ghin_number,
         home_town, home_course, college,
         instagram, twitter, tiktok,
         referred_by,
         square_customer_id, square_card_id,
         scheduled_charge_date, charge_amount_cents
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
         $12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24
       )`,
      [
        playerInfo.firstName.trim(),
        playerInfo.lastName.trim(),
        playerInfo.nickname?.trim() || null,
        playerInfo.address.trim(),
        playerInfo.city.trim(),
        playerInfo.state.trim(),
        playerInfo.zip.trim(),
        playerInfo.country.trim(),
        playerInfo.nationality.trim(),
        playerInfo.email.toLowerCase().trim(),
        playerInfo.phone.trim(),
        playerInfo.playingStatus,
        playerInfo.ghinNumber?.trim() || null,
        playerInfo.homeTown.trim(),
        playerInfo.homeCourse.trim(),
        playerInfo.college?.trim() || null,
        playerInfo.instagram?.trim() || null,
        playerInfo.twitter?.trim() || null,
        playerInfo.tiktok?.trim() || null,
        playerInfo.referredBy?.trim() || null,
        customerId,
        cardId,
        chargeDate,
        chargeAmountCents,
      ]
    );
  } catch (err) {
    console.error(`DB insert error for ${playerInfo.email}:`, err);
    sendAdminAlertEmail({
      subject: `DB insert failed for ${playerInfo.email}`,
      errorType: 'Database insert',
      playerEmail: playerInfo.email,
      playerInfo,
      detail: err.message,
    }).catch(() => {});
    return res.status(500).json({
      error: 'Registration could not be saved. Please contact info@pulsegolfleague.com.',
    });
  }

  // ── Confirmation email (non-blocking) ───────────────────

  sendConfirmationEmail(playerInfo, { amountFormatted: `$${(chargeAmountCents / 100).toFixed(2)}` }).catch((err) => {
    console.error(`Confirmation email failed for ${playerInfo.email}:`, err);
  });

  return res.status(201).json({ success: true });
});
