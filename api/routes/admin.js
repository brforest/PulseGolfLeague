import { Router } from 'express';
import pool from '../db/index.js';

export const adminRoute = Router();

// ── Auth middleware ────────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(503).json({ error: 'Admin access not configured.' });
  }

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || token !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  next();
}

adminRoute.use(requireAdmin);

// ── GET /api/admin/registrations ───────────────────────────────────────────────
adminRoute.get('/registrations', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         first_name, last_name, nickname,
         address, city, state, zip, country,
         nationality, email, phone,
         playing_status, ghin_number,
         home_town, home_course, college,
         instagram, twitter, tiktok,
         square_customer_id, square_card_id,
         charge_status, charge_amount_cents,
         scheduled_charge_date, charged_at,
         square_payment_id, charge_error,
         registered_at, confirmation_email_sent
       FROM registrations
       ORDER BY registered_at ASC`
    );
    res.json({ registrations: result.rows });
  } catch (err) {
    console.error('GET /admin/registrations error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── PATCH /api/admin/registrations/:id ────────────────────────────────────────
// Accepts a partial update of editable fields. Payment charge fields
// (charged_at, square_payment_id, charge_amount_cents) are intentionally
// excluded to prevent accidental financial record corruption.
const EDITABLE_FIELDS = [
  'first_name', 'last_name', 'nickname',
  'address', 'city', 'state', 'zip', 'country',
  'nationality', 'email', 'phone',
  'playing_status', 'ghin_number',
  'home_town', 'home_course', 'college',
  'instagram', 'twitter', 'tiktok',
  'charge_status', 'scheduled_charge_date', 'charge_error',
];

adminRoute.patch('/registrations/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid registration ID.' });
  }

  const updates = req.body;
  if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
    return res.status(400).json({ error: 'Request body must be a JSON object.' });
  }

  const allowedKeys = Object.keys(updates).filter((k) => EDITABLE_FIELDS.includes(k));
  if (allowedKeys.length === 0) {
    return res.status(400).json({ error: 'No editable fields provided.' });
  }

  // Validate charge_status if provided
  if (updates.charge_status !== undefined) {
    const validStatuses = ['pending', 'charged', 'failed', 'withdrawn'];
    if (!validStatuses.includes(updates.charge_status)) {
      return res.status(400).json({ error: 'Invalid charge_status value.' });
    }
  }

  // Validate playing_status if provided
  if (updates.playing_status !== undefined) {
    if (!['Professional', 'Amateur'].includes(updates.playing_status)) {
      return res.status(400).json({ error: 'Invalid playing_status value.' });
    }
  }

  // Validate email format if provided
  if (updates.email !== undefined) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }
  }

  const setClauses = allowedKeys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const values = allowedKeys.map((k) => updates[k]);
  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE registrations SET ${setClauses} WHERE id = $${values.length} RETURNING id`,
      values
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Registration not found.' });
    }
    res.json({ success: true, id });
  } catch (err) {
    // Unique constraint on email
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email address already in use by another registration.' });
    }
    console.error('PATCH /admin/registrations error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── DELETE /api/admin/registrations/:id ───────────────────────────────────────
adminRoute.delete('/registrations/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid registration ID.' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM registrations WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Registration not found.' });
    }
    res.json({ success: true, id });
  } catch (err) {
    console.error('DELETE /admin/registrations error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});
