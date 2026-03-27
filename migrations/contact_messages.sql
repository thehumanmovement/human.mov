-- Create contact_messages table for storing "We'd Love to Hear From You" submissions
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  country text,
  zip_code text,
  contactable boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index on email for lookups
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages (email);

-- Index on created_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages (created_at DESC);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow inserts from the anon key (public form submissions)
CREATE POLICY "Allow public inserts" ON contact_messages
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated/service role can read
CREATE POLICY "Allow authenticated reads" ON contact_messages
  FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
