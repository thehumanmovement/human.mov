-- Events table — drives the /event/[slug] dynamic route.
-- Editable via admin UI without a deploy.
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,                   -- markdown rendered on the public page
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  location TEXT,                      -- "Virtual" or physical address
  meeting_url TEXT,                   -- Zoom/Google Meet link, included in confirmation
  capacity INT,                       -- null = unlimited
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events (slug);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events (starts_at);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_events_updated_at ON events;
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- Event RSVPs table
CREATE TABLE IF NOT EXISTS event_rsvps (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, email)
);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON event_rsvps (event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_created_at ON event_rsvps (created_at DESC);

-- RLS: public can insert RSVPs (the API does this with the anon key);
-- only authenticated/service can read events and RSVPs.
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- Public can read published events (needed for the public /event/[slug] page using anon key)
DROP POLICY IF EXISTS "Public can read published events" ON events;
CREATE POLICY "Public can read published events" ON events
  FOR SELECT
  USING (is_published = true);

-- Service role has full access for admin UI (uses service_role key)
DROP POLICY IF EXISTS "Service role full access events" ON events;
CREATE POLICY "Service role full access events" ON events
  FOR ALL
  USING (auth.role() = 'service_role');

-- Public can insert RSVPs
DROP POLICY IF EXISTS "Public can insert RSVPs" ON event_rsvps;
CREATE POLICY "Public can insert RSVPs" ON event_rsvps
  FOR INSERT
  WITH CHECK (true);

-- Only service role can read RSVPs (used by admin UI)
DROP POLICY IF EXISTS "Service role can read RSVPs" ON event_rsvps;
CREATE POLICY "Service role can read RSVPs" ON event_rsvps
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Seed the actionar event (unpublished — team fills in copy before publishing)
INSERT INTO events (slug, name, description, location, is_published)
VALUES (
  'actionar',
  'The Actionar',
  '**Description coming soon.** This event is currently a draft. Update the description, time, and meeting link via the admin UI before publishing.',
  'Virtual',
  false
)
ON CONFLICT (slug) DO NOTHING;
