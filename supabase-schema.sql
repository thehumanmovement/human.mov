create table signups (
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
