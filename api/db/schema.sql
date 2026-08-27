-- Run this once against your Postgres database to set up the schema.
-- DigitalOcean: psql $DATABASE_URL -f db/schema.sql

CREATE TABLE IF NOT EXISTS registrations (
  id                      SERIAL PRIMARY KEY,

  -- Personal
  first_name              TEXT        NOT NULL,
  last_name               TEXT        NOT NULL,
  nickname                TEXT,
  nationality             TEXT        NOT NULL,
  home_town               TEXT        NOT NULL,
  home_course             TEXT        NOT NULL,
  college                 TEXT,

  -- Contact
  address                 TEXT        NOT NULL,
  city                    TEXT        NOT NULL,
  state                   TEXT        NOT NULL,
  zip                     TEXT        NOT NULL,
  country                 TEXT        NOT NULL,
  email                   TEXT        NOT NULL,
  phone                   TEXT        NOT NULL,

  -- Golf
  playing_status          TEXT        NOT NULL CHECK (playing_status IN ('Professional', 'Amateur')),
  ghin_number             TEXT,

  -- Referral
  referred_by             TEXT,

  -- Social
  instagram               TEXT,
  twitter                 TEXT,
  tiktok                  TEXT,

  -- Square
  square_customer_id      TEXT,
  square_card_id          TEXT,

  -- Payment lifecycle
  charge_status           TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (charge_status IN ('pending', 'charged', 'failed', 'withdrawn')),
  charge_amount_cents     INTEGER     NOT NULL DEFAULT 51900,   -- $519.00
  scheduled_charge_date   DATE        NOT NULL DEFAULT '2026-08-25',
  charged_at              TIMESTAMPTZ,
  square_payment_id       TEXT,
  charge_error            TEXT,

  -- Enrollment
  active                  BOOLEAN     NOT NULL DEFAULT TRUE,

  -- Meta
  registered_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmation_email_sent BOOLEAN     NOT NULL DEFAULT FALSE,

  CONSTRAINT registrations_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_reg_email         ON registrations (email);
CREATE INDEX IF NOT EXISTS idx_reg_charge_status ON registrations (charge_status);
CREATE INDEX IF NOT EXISTS idx_reg_charge_date   ON registrations (scheduled_charge_date);
CREATE INDEX IF NOT EXISTS idx_reg_referred_by   ON registrations (referred_by);

-- Migration for existing databases:
-- ALTER TABLE registrations ADD COLUMN IF NOT EXISTS referred_by TEXT;

CREATE TABLE IF NOT EXISTS host_housing_signups (
  id                SERIAL PRIMARY KEY,

  -- 'host' = Yolo Fliers Club member offering housing
  -- 'player' = PGL player requesting housing
  role              TEXT        NOT NULL CHECK (role IN ('host', 'player')),

  first_name        TEXT        NOT NULL,
  last_name         TEXT        NOT NULL,
  email             TEXT        NOT NULL,
  phone             TEXT        NOT NULL,

  -- Only set for hosts: number of players they can accommodate
  capacity          INTEGER     CHECK (capacity IS NULL OR (capacity > 0 AND capacity <= 20)),

  -- 'pgl_only' = Sept 8-11 · 'pgl_and_qschool' = Sept 8-11 & Sept 16-18
  date_option       TEXT        NOT NULL CHECK (date_option IN ('pgl_only', 'pgl_and_qschool')),

  notes             TEXT,

  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hh_role         ON host_housing_signups (role);
CREATE INDEX IF NOT EXISTS idx_hh_submitted_at ON host_housing_signups (submitted_at);

CREATE TABLE IF NOT EXISTS media_crew_signups (
  id                SERIAL PRIMARY KEY,

  name              TEXT        NOT NULL,
  email             TEXT        NOT NULL,
  phone             TEXT        NOT NULL,
  school            TEXT        NOT NULL,
  major             TEXT,
  year_in_school    TEXT,

  -- Subset of 'sep_8', 'sep_9', 'sep_10', 'sep_11'
  available_dates   TEXT[]      NOT NULL DEFAULT '{}',

  -- Subset of 'camera_operator', 'photography', 'livestream_broadcast',
  -- 'social_media_bts', 'editing', 'production_assistant'
  roles_interested  TEXT[]      NOT NULL DEFAULT '{}',

  experience        TEXT,
  equipment         TEXT,

  golf_knowledge    TEXT        NOT NULL
                      CHECK (golf_knowledge IN ('none', 'some', 'golfer', 'very_familiar')),

  portfolio_link    TEXT,
  has_transportation TEXT       NOT NULL
                      CHECK (has_transportation IN ('yes', 'no', 'need_help')),

  why_interested    TEXT,

  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mc_submitted_at ON media_crew_signups (submitted_at);
