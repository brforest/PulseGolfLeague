import { Router } from 'express';
import pool from '../db/index.js';

export const hostHousingRoute = Router();

const DATE_OPTIONS = ['pgl_only', 'pgl_and_qschool'];

function validateContact(body) {
  const { firstName, lastName, email, phone, dateOption } = body ?? {};

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
  if (!DATE_OPTIONS.includes(dateOption)) {
    return 'Please select a valid date option.';
  }
  return null;
}

// ── POST /api/host-housing/host ─────────────────────────────────────────────
// Yolo Fliers Club member signing up to host players
hostHousingRoute.post('/host-housing/host', async (req, res) => {
  const error = validateContact(req.body);
  if (error) return res.status(400).json({ error });

  const { firstName, lastName, email, phone, dateOption, capacity, notes } = req.body;

  const capacityNum = Number(capacity);
  if (!Number.isInteger(capacityNum) || capacityNum < 1 || capacityNum > 20) {
    return res.status(400).json({ error: 'Please provide a valid number of players you can host (1-20).' });
  }

  if (notes !== undefined && notes !== null && (typeof notes !== 'string' || notes.length > 1000)) {
    return res.status(400).json({ error: 'Notes must be 1000 characters or fewer.' });
  }

  try {
    await pool.query(
      `INSERT INTO host_housing_signups
         (role, first_name, last_name, email, phone, capacity, date_option, notes)
       VALUES ('host', $1, $2, $3, $4, $5, $6, $7)`,
      [
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        capacityNum,
        dateOption,
        notes?.trim() || null,
      ]
    );
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /host-housing/host error:', err);
    return res.status(500).json({ error: 'Could not save your sign-up. Please try again.' });
  }
});

// ── POST /api/host-housing/player ───────────────────────────────────────────
// PGL player requesting host housing
hostHousingRoute.post('/host-housing/player', async (req, res) => {
  const error = validateContact(req.body);
  if (error) return res.status(400).json({ error });

  const { firstName, lastName, email, phone, dateOption, notes } = req.body;

  if (notes !== undefined && notes !== null && (typeof notes !== 'string' || notes.length > 1000)) {
    return res.status(400).json({ error: 'Notes must be 1000 characters or fewer.' });
  }

  try {
    await pool.query(
      `INSERT INTO host_housing_signups
         (role, first_name, last_name, email, phone, date_option, notes)
       VALUES ('player', $1, $2, $3, $4, $5, $6)`,
      [
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        dateOption,
        notes?.trim() || null,
      ]
    );
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /host-housing/player error:', err);
    return res.status(500).json({ error: 'Could not save your request. Please try again.' });
  }
});
