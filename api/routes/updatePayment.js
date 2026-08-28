import { Router } from 'express';
import pool from '../db/index.js';
import { saveCardOnFile } from '../services/square.js';
import { sendCustomEmailHtml, sendAdminAlertEmail } from '../services/email.js';

export const updatePaymentRoute = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === 'string' && email.trim().length <= 200 && EMAIL_RE.test(email.trim());
}

// Look up a registration by email so the player can confirm it's them
// before we show them a card form. Only returns their name — no payment data.
updatePaymentRoute.post('/update-payment/lookup', async (req, res) => {
  const { email } = req.body ?? {};

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  let result;
  try {
    result = await pool.query(
      'SELECT first_name, last_name, square_customer_id FROM registrations WHERE email = $1 AND active = TRUE',
      [email.toLowerCase().trim()]
    );
  } catch (err) {
    console.error('DB error during update-payment lookup:', err);
    return res.status(503).json({ error: 'Temporarily unavailable. Please try again in a moment.' });
  }

  const reg = result.rows[0];
  if (!reg || !reg.square_customer_id) {
    return res.status(404).json({
      error: 'No matching payment profile found for that email. Please contact info@pulsegolfleague.com.',
    });
  }

  res.json({ firstName: reg.first_name, lastName: reg.last_name });
});

// Tokenize a new card client-side, then save it onto the player's existing
// Square customer and update our record of which card is on file.
updatePaymentRoute.post('/update-payment', async (req, res) => {
  const { email, nonce } = req.body ?? {};

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (!nonce || typeof nonce !== 'string' || nonce.length > 300) {
    return res.status(400).json({ error: 'Invalid payment token.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  let reg;
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, square_customer_id FROM registrations WHERE email = $1 AND active = TRUE',
      [normalizedEmail]
    );
    reg = result.rows[0];
  } catch (err) {
    console.error('DB error during update-payment:', err);
    return res.status(503).json({ error: 'Temporarily unavailable. Please try again in a moment.' });
  }

  if (!reg || !reg.square_customer_id) {
    return res.status(404).json({
      error: 'No matching payment profile found for that email. Please contact info@pulsegolfleague.com.',
    });
  }

  let cardId;
  try {
    cardId = await saveCardOnFile(nonce, reg.square_customer_id, {
      firstName: reg.first_name,
      lastName: reg.last_name,
    });
  } catch (err) {
    console.error(`Square card update error for ${reg.email}:`, err);
    const firstError = err?.errors?.[0] ?? err?.body?.errors?.[0];
    if (firstError?.category === 'AUTHENTICATION_ERROR') {
      sendAdminAlertEmail({
        subject: 'Square authentication error — check API credentials',
        errorType: 'Square AUTHENTICATION_ERROR (update-payment)',
        playerEmail: reg.email,
        playerInfo: { firstName: reg.first_name, lastName: reg.last_name, email: reg.email },
        detail: firstError?.detail,
        raw: err?.body,
      }).catch(() => {});
      return res.status(502).json({
        error: 'Payment system configuration error. Please contact info@pulsegolfleague.com.',
      });
    }
    sendAdminAlertEmail({
      subject: `Card update failed for ${reg.email}`,
      errorType: `Square ${firstError?.category ?? 'unknown'} (update-payment)`,
      playerEmail: reg.email,
      playerInfo: { firstName: reg.first_name, lastName: reg.last_name, email: reg.email },
      detail: firstError?.detail,
      raw: err?.body,
    }).catch(() => {});
    return res.status(502).json({
      error: firstError?.detail || 'Could not save payment card. Please check your card details.',
    });
  }

  try {
    await pool.query('UPDATE registrations SET square_card_id = $1 WHERE id = $2', [cardId, reg.id]);
  } catch (err) {
    console.error(`DB update error for registration ${reg.id}:`, err);
    return res.status(500).json({
      error: 'Your card was saved, but we could not update our records. Please contact info@pulsegolfleague.com.',
    });
  }

  sendCustomEmailHtml({
    to: reg.email,
    subject: 'Payment card updated — Pulse Golf League',
    bodyHtml: `<p>Hi ${reg.first_name},</p><p>Your payment card on file with Pulse Golf League has been updated successfully.</p><p>If you did not make this change, please contact us immediately at info@pulsegolfleague.com.</p>`,
  }).catch((err) => console.error('Failed to send card-updated confirmation email:', err));

  res.json({ success: true });
});
