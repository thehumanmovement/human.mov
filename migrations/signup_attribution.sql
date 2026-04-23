-- Add attribution columns to signups table for UTM and referrer tracking.
-- Last-touch attribution: captures whatever UTMs were in the URL at signup time.

ALTER TABLE signups ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS utm_term TEXT;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS landing_path TEXT;

-- Index on utm_source for campaign reporting queries
CREATE INDEX IF NOT EXISTS idx_signups_utm_source ON signups (utm_source);
CREATE INDEX IF NOT EXISTS idx_signups_utm_campaign ON signups (utm_campaign);
