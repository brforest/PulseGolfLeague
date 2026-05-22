import { Router } from 'express';
import pool from '../db/index.js';

export const playersRoute = Router();

/**
 * GET /api/players
 * Public — returns a minimal player list for the Tournament Info page.
 * Deliberately omits PII (email, address, phone, payment details).
 */
playersRoute.get('/players', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         first_name,
         last_name,
         nickname,
         playing_status,
         home_town,
         home_course,
         nationality,
         registered_at
       FROM registrations
       WHERE charge_status != 'withdrawn'
         AND active = TRUE
       ORDER BY registered_at ASC`
    );

    const players = result.rows.map((r) => ({
      id: r.id,
      firstName: r.first_name,
      lastName: r.last_name,
      nickname: r.nickname || null,
      playingStatus: r.playing_status,
      homeTown: r.home_town,
      homeCourse: r.home_course,
      nationality: r.nationality,
      registeredAt: r.registered_at,
    }));

    res.json({ players, count: players.length });
  } catch (err) {
    console.error('GET /players error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});
