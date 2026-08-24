import { Router } from 'express';
import { Resend } from 'resend';
import pool from '../db/index.js';
import { sendCustomEmail, sendCustomEmailHtml, sendCustomEmailReply } from '../services/email.js';

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
         referred_by,
         square_customer_id, square_card_id,
         charge_status, charge_amount_cents,
         scheduled_charge_date, charged_at,
         square_payment_id, charge_error,
         registered_at, confirmation_email_sent,
         active
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
  'referred_by',
  'charge_status', 'scheduled_charge_date', 'charge_error',
  'active',
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

  // Validate active if provided
  if (updates.active !== undefined) {
    if (typeof updates.active !== 'boolean') {
      return res.status(400).json({ error: 'active must be a boolean.' });
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

// ── GET /api/admin/host-housing ────────────────────────────────────────────────
adminRoute.get('/host-housing', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id, role, first_name, last_name, email, phone,
         capacity, date_option, notes, submitted_at
       FROM host_housing_signups
       ORDER BY submitted_at ASC`
    );
    res.json({ signups: result.rows });
  } catch (err) {
    console.error('GET /admin/host-housing error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── DELETE /api/admin/host-housing/:id ─────────────────────────────────────────
adminRoute.delete('/host-housing/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid ID.' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM host_housing_signups WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Sign-up not found.' });
    }
    res.json({ success: true, id });
  } catch (err) {
    console.error('DELETE /admin/host-housing error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── GET /api/admin/referrals ──────────────────────────────────────────────────
// Returns each referrer name along with the count of players they referred
// and the list of those players. Used to determine who earns a discount.
adminRoute.get('/referrals', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         referred_by,
         COUNT(*)::int AS referral_count,
         json_agg(json_build_object(
           'id', id,
           'first_name', first_name,
           'last_name', last_name,
           'email', email,
           'charge_status', charge_status,
           'active', active
         ) ORDER BY registered_at ASC) AS referred_players
       FROM registrations
       WHERE referred_by IS NOT NULL AND referred_by <> ''
       GROUP BY referred_by
       ORDER BY referral_count DESC, referred_by ASC`
    );
    res.json({ referrals: result.rows });
  } catch (err) {
    console.error('GET /admin/referrals error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── GET /api/admin/emails ─────────────────────────────────────────────────────
// Returns the list of sent emails from Resend (metadata only, no html body)
adminRoute.get('/emails', async (req, res) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Email service not configured.' });

  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

  try {
    const response = await fetch(`https://api.resend.com/emails?limit=${limit}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Resend API error.' });
    }
    res.json(data);
  } catch (err) {
    console.error('GET /admin/emails error:', err);
    res.status(500).json({ error: 'Failed to fetch emails from Resend.' });
  }
});

// ── GET /api/admin/emails/:emailId ────────────────────────────────────────────
// Returns a single email from Resend including the full html body for preview
adminRoute.get('/emails/:emailId', async (req, res) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Email service not configured.' });

  const { emailId } = req.params;
  // Resend email IDs are UUIDs
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(emailId)) {
    return res.status(400).json({ error: 'Invalid email ID.' });
  }

  try {
    const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Resend API error.' });
    }
    res.json(data);
  } catch (err) {
    console.error('GET /admin/emails/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch email from Resend.' });
  }
});

// ── POST /api/admin/emails/send ───────────────────────────────────────────────
// Sends a custom branded email to one or more recipients.
// Body accepts either:
//   { recipients, subject, body }     — plain-text body (paragraph-per-blank-line)
//   { recipients, subject, bodyHtml } — rich HTML body from the composer
adminRoute.post('/emails/send', async (req, res) => {
  const { recipients, subject, body, bodyHtml, inReplyTo } = req.body;
  const useHtml = bodyHtml !== undefined;
  const isReply = !!(inReplyTo && typeof inReplyTo === 'string' && inReplyTo.length <= 1000);

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'recipients must be a non-empty array.' });
  }
  if (recipients.length > 200) {
    return res.status(400).json({ error: 'Maximum 200 recipients per send.' });
  }
  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    return res.status(400).json({ error: 'subject is required.' });
  }
  if (subject.length > 200) {
    return res.status(400).json({ error: 'subject too long (max 200 chars).' });
  }

  if (useHtml) {
    if (typeof bodyHtml !== 'string' || bodyHtml.replace(/<[^>]*>/g, '').trim().length === 0) {
      return res.status(400).json({ error: 'Message body cannot be empty.' });
    }
    if (bodyHtml.length > 200000) {
      return res.status(400).json({ error: 'Body HTML too long (max 200,000 chars).' });
    }
  } else {
    if (!body || typeof body !== 'string' || !body.trim()) {
      return res.status(400).json({ error: 'body is required.' });
    }
    if (body.length > 50000) {
      return res.status(400).json({ error: 'body too long (max 50,000 chars).' });
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalid = recipients.filter((r) => typeof r !== 'string' || !emailRegex.test(r));
  if (invalid.length > 0) {
    return res.status(400).json({ error: `Invalid email address(es): ${invalid.join(', ')}` });
  }

  const errors = [];
  const trimmedSubject = subject.trim();

  // Send individually so each recipient's To: header shows only their address.
  // Throttled to one per 200ms to stay under Resend's 5 req/sec rate limit.
  for (const to of recipients) {
    const sendFn = (isReply && useHtml)
      ? sendCustomEmailReply({ to, subject: trimmedSubject, bodyHtml, inReplyTo })
      : useHtml
        ? sendCustomEmailHtml({ to, subject: trimmedSubject, bodyHtml })
        : sendCustomEmail({ to, subject: trimmedSubject, bodyText: body });
    await sendFn.catch((err) => { errors.push(`${to}: ${err.message}`); });
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  if (errors.length === recipients.length) {
    return res.status(500).json({ error: 'All sends failed.', details: errors });
  }

  res.json({
    success: true,
    sent: recipients.length - errors.length,
    failed: errors.length,
    ...(errors.length > 0 && { errors }),
  });
});

// ── GET /api/admin/inbox ──────────────────────────────────────────────────────
// Returns the most recent received emails from Resend.
adminRoute.get('/inbox', async (req, res) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.receiving.list({ limit: 50 });
    if (error) throw new Error(error.message || 'Failed to fetch inbox.');
    const emails = (data?.data || []).map((e) => ({
      id: e.id,
      from_address: e.from || '',
      from_name: null,
      to_address: Array.isArray(e.to) ? e.to[0] : (e.to || null),
      subject: e.subject || null,
      received_at: e.created_at || null,
    }));
    res.json({ emails });
  } catch (err) {
    console.error('GET /admin/inbox error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── GET /api/admin/inbox/:id ──────────────────────────────────────────────────
// Returns a single received email including HTML/text body from Resend.
adminRoute.get('/inbox/:id', async (req, res) => {
  const { id } = req.params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return res.status(400).json({ error: 'Invalid inbox email ID.' });
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.receiving.get(id);
    if (error) throw new Error(error.message || 'Failed to fetch email.');
    if (!data) return res.status(404).json({ error: 'Not found.' });
    // headers.from may include display name: "Name <addr@example.com>"
    const headerFrom = data.headers?.from || data.from || '';
    const nameAddrMatch = /^(.*?)\s*<([^>]+)>$/.exec(headerFrom);
    res.json({
      id: data.id,
      message_id: data.message_id || null,
      from_address: nameAddrMatch ? nameAddrMatch[2].trim() : (data.from || ''),
      from_name: nameAddrMatch ? (nameAddrMatch[1].trim() || null) : null,
      to_address: Array.isArray(data.to) ? data.to[0] : (data.to || null),
      subject: data.subject || null,
      received_at: data.created_at || null,
      html_body: data.html || null,
      text_body: data.text || null,
    });
  } catch (err) {
    console.error('GET /admin/inbox/:id error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

