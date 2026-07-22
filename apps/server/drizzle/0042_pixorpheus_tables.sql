-- Migration: Pixorpheus tables for Supabase
-- These tables were previously in a standalone PostgreSQL (DATABASE_URL).
-- Run this in the Supabase SQL editor to create them.

-- Tickets (support system)
CREATE TABLE IF NOT EXISTS tickets (
  msg_ts TEXT PRIMARY KEY,
  description TEXT,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  opened_by_slack_id TEXT,
  claimed_by_slack_id TEXT,
  closed_by_slack_id TEXT,
  closed_at TIMESTAMPTZ,
  last_msg_at TIMESTAMPTZ,
  permalink TEXT,
  ticket_msg_ts TEXT,
  ticket_number SERIAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_closed_at ON tickets(closed_at);
CREATE INDEX IF NOT EXISTS idx_tickets_description ON tickets USING gin(to_tsvector('english', COALESCE(description, '')));

-- Helpers (team members who can manage tickets)
CREATE TABLE IF NOT EXISTS helpers (
  slack_user_id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User memory (what the bot remembers about users)
CREATE TABLE IF NOT EXISTS user_memory (
  slack_user_id TEXT PRIMARY KEY,
  facts JSONB NOT NULL DEFAULT '[]'
);

-- Program memory (server-wide facts)
CREATE TABLE IF NOT EXISTS program_memory (
  id SERIAL PRIMARY KEY,
  fact TEXT NOT NULL
);

-- User personality traits (AI-extracted)
CREATE TABLE IF NOT EXISTS user_personality (
  slack_user_id TEXT PRIMARY KEY,
  traits JSONB NOT NULL DEFAULT '[]'
);

-- Polls
CREATE TABLE IF NOT EXISTS polls (
  id SERIAL PRIMARY KEY,
  channel TEXT NOT NULL,
  message_ts TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  closes_at BIGINT NOT NULL
);

-- Style memory (learned writing style)
CREATE TABLE IF NOT EXISTS style_memory (
  id SERIAL PRIMARY KEY,
  notes TEXT NOT NULL
);
