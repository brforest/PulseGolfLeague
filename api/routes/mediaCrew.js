import { Router } from 'express';
import pool from '../db/index.js';

export const mediaCrewRoute = Router();

const DATE_VALUES = ['sep_8', 'sep_9', 'sep_10', 'sep_11'];
const ROLE_VALUES = [
  'camera_operator',
  'photography',
  'livestream_broadcast',
  'social_media_bts',
  'editing',
  'production_assistant',
];
const GOLF_KNOWLEDGE_VALUES = ['none', 'some', 'golfer', 'very_familiar'];
const TRANSPORTATION_VALUES = ['yes', 'no', 'need_help'];

function isStringArraySubset(arr, allowed) {
  return Array.isArray(arr) && arr.every((v) => typeof v === 'string' && allowed.includes(v));
}

function validate(body) {
  const {
    name, email, phone, school, major, yearInSchool,
    availableDates, rolesInterested, experience, equipment,
    golfKnowledge, portfolioLink, hasTransportation, whyInterested,
  } = body ?? {};

  if (!name || typeof name !== 'string' || !name.trim() || name.trim().length > 150) {
    return 'Please provide your name (max 150 characters).';
  }
  if (
    !email ||
    typeof email !== 'string' ||
    email.length > 200 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return 'Please provide a valid email address.';
  }
  if (!phone || typeof phone !== 'string' || !phone.trim() || phone.trim().length > 30) {
    return 'Please provide a valid phone number.';
  }
  if (!school || typeof school !== 'string' || !school.trim() || school.trim().length > 200) {
    return 'Please provide your school (max 200 characters).';
  }
  if (major !== undefined && major !== null && (typeof major !== 'string' || major.length > 200)) {
    return 'Major/program must be 200 characters or fewer.';
  }
  if (yearInSchool !== undefined && yearInSchool !== null && (typeof yearInSchool !== 'string' || yearInSchool.length > 100)) {
    return 'Year in school must be 100 characters or fewer.';
  }
  if (!isStringArraySubset(availableDates, DATE_VALUES) || availableDates.length === 0) {
    return 'Please select at least one available date.';
  }
  if (!isStringArraySubset(rolesInterested, ROLE_VALUES) || rolesInterested.length === 0) {
    return 'Please select at least one role.';
  }
  if (experience !== undefined && experience !== null && (typeof experience !== 'string' || experience.length > 1000)) {
    return 'Experience must be 1000 characters or fewer.';
  }
  if (equipment !== undefined && equipment !== null && (typeof equipment !== 'string' || equipment.length > 1000)) {
    return 'Equipment must be 1000 characters or fewer.';
  }
  if (!GOLF_KNOWLEDGE_VALUES.includes(golfKnowledge)) {
    return 'Please select your golf knowledge level.';
  }
  if (portfolioLink !== undefined && portfolioLink !== null && (typeof portfolioLink !== 'string' || portfolioLink.length > 500)) {
    return 'Portfolio link must be 500 characters or fewer.';
  }
  if (!TRANSPORTATION_VALUES.includes(hasTransportation)) {
    return 'Please let us know about transportation.';
  }
  if (whyInterested !== undefined && whyInterested !== null && (typeof whyInterested !== 'string' || whyInterested.length > 1000)) {
    return 'Answer must be 1000 characters or fewer.';
  }
  return null;
}

// ── POST /api/media-crew ─────────────────────────────────────────────────────
mediaCrewRoute.post('/media-crew', async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });

  const {
    name, email, phone, school, major, yearInSchool,
    availableDates, rolesInterested, experience, equipment,
    golfKnowledge, portfolioLink, hasTransportation, whyInterested,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO media_crew_signups
         (name, email, phone, school, major, year_in_school,
          available_dates, roles_interested, experience, equipment,
          golf_knowledge, portfolio_link, has_transportation, why_interested)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        school.trim(),
        major?.trim() || null,
        yearInSchool?.trim() || null,
        availableDates,
        rolesInterested,
        experience?.trim() || null,
        equipment?.trim() || null,
        golfKnowledge,
        portfolioLink?.trim() || null,
        hasTransportation,
        whyInterested?.trim() || null,
      ]
    );
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /media-crew error:', err);
    return res.status(500).json({ error: 'Could not save your sign-up. Please try again.' });
  }
});
