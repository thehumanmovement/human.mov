-- Create signups table
create table if not exists signups (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text,
  zip_code text,
  email_code text,
  email_verified boolean default false,
  phone text,
  phone_code text,
  phone_verified boolean default false,
  created_at timestamptz default now()
);

-- RLS policies
alter table signups enable row level security;

-- Allow anonymous inserts (signup form)
create policy "Allow anonymous inserts"
  on signups for insert
  to anon
  with check (true);

-- Allow anonymous updates (verification flow)
create policy "Allow anonymous updates"
  on signups for update
  to anon
  using (true)
  with check (true);

-- Allow anonymous select (verification lookup)
create policy "Allow anonymous select"
  on signups for select
  to anon
  using (true);
