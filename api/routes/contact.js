import { Router } from 'express';
import { sendContactEmail } from '../services/email.js';

export const contactRoute = Router();

contactRoute.post('/contact', async (req, res) => {
  const { name, email, message } = req.body ?? {};

  if (!name || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 100) {
    return res.status(400).json({ error: 'Please provide your name (max 100 characters).' });
  }

  if (
    !email ||
    typeof email !== 'string' ||
    email.length > 200 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (
    !message ||
    typeof message !== 'string' ||
    message.trim().length < 1 ||
    message.trim().length > 2000
  ) {
    return res.status(400).json({ error: 'Please provide a message (max 2000 characters).' });
  }

  try {
    await sendContactEmail({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Contact email failed:', err);
    return res.status(500).json({
      error: 'Failed to send your message. Please email us directly at info@pulsegolfleague.com.',
    });
  }
});
