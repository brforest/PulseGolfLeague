import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { registerRoute } from './routes/register.js';
import { playersRoute } from './routes/players.js';
import { adminRoute } from './routes/admin.js';
import { contactRoute } from './routes/contact.js';
import { hostHousingRoute } from './routes/hostHousing.js';
import { mediaCrewRoute } from './routes/mediaCrew.js';
import { startChargeJob } from './jobs/chargeRegistrations.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Trust nginx reverse proxy
app.set('trust proxy', 1);

// ── Security headers ──────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────
// Accepts a comma-separated list so you can allow both www and apex domains
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow server-to-server calls (no origin) and listed origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body parsing ──────────────────────────────────────────
// Admin email composer allows file attachments (base64-encoded), so it needs a
// much larger body limit than the rest of the API. Registered first so it wins
// for that path; body-parser skips re-parsing on the global middleware below.
app.use('/api/admin/emails/send', express.json({ limit: '15mb' }));
app.use(express.json({ limit: '20kb' }));

// ── Rate limiting ─────────────────────────────────────────
// Applied only to mutating API routes
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again later.' },
});

// Generous limit for public read routes
const publicReadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again later.' },
});

// Admin endpoints — only counts unauthenticated/failed requests.
// Authenticated requests are skipped so the dashboard isn't self-limiting.
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 bad/unauthenticated requests per IP per 15 min
  skip: (req) => {
    const token = (req.headers['authorization'] || '').replace('Bearer ', '');
    const pw = process.env.ADMIN_PASSWORD;
    return !!(pw && token === pw);
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again later.' },
});

// ── Routes ────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
app.use('/api/admin', adminLimiter, adminRoute);   // must be before the /api catch-alls
app.use('/api', publicReadLimiter, playersRoute);
app.use('/api', registrationLimiter, registerRoute);
app.use('/api', registrationLimiter, contactRoute);
app.use('/api', registrationLimiter, hostHousingRoute);
app.use('/api', registrationLimiter, mediaCrewRoute);

// ── 404 fallthrough ───────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));

// ── Global error handler ──────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`PGL API running on port ${PORT}`);
  startChargeJob();
});
