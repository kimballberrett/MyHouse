-- Migration: add columns required by the Craigslist scraper.
-- Run this against your existing database (local Postgres or Supabase).
--
-- source_id  — Craigslist post ID, used as a unique key to prevent duplicate inserts.
-- latitude   — From JSON-LD structured data on the Craigslist search page.
-- longitude  — From JSON-LD structured data on the Craigslist search page.
--              Both are required for max_distance_miles filtering against user preferences.

ALTER TABLE listings ADD COLUMN IF NOT EXISTS source_id VARCHAR(100) UNIQUE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS latitude  NUMERIC(10, 7);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
