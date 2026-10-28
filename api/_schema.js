// Database tables for Shifokor. Run automatically by api/app.js on first use; safe to run again.
// Row-level security is on with no policies, so Supabase's public Data API cannot read these tables.
// Only the server, connecting with the connection string, can.
module.exports = `
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('patient', 'doctor', 'clinic')),
  name text not null check (char_length(name) between 1 and 200),
  email text unique check (email is null or char_length(email) <= 254),
  phone text unique check (phone is null or phone ~ '^998[0-9]{9}$'),
  tg text check (tg is null or char_length(tg) <= 40),
  pw_hash text not null,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_sessions (
  token_hash text primary key,
  user_id uuid not null references app_users (id) on delete cascade,
  expires_at timestamptz not null
);
create index if not exists app_sessions_user_idx on app_sessions (user_id);

create table if not exists app_consults (
  id uuid primary key default gen_random_uuid(),
  n bigint generated always as identity (start with 1001),
  patient_id uuid not null references app_users (id) on delete cascade,
  type text not null check (type in ('text', 'audio', 'video')),
  who text not null default 'self' check (who in ('self', 'child', 'other')),
  name text not null check (char_length(name) between 1 and 200),
  age int check (age between 0 and 130),
  sex text check (sex in ('f', 'm')),
  phone text not null check (char_length(phone) <= 20),
  region text check (region is null or char_length(region) <= 20),
  district text check (district is null or char_length(district) <= 20),
  complaint text not null check (char_length(complaint) between 10 and 1500),
  since int check (since between 0 and 4),
  chronic text check (chronic is null or char_length(chronic) <= 500),
  meds text check (meds is null or char_length(meds) <= 500),
  allergy text check (allergy is null or char_length(allergy) <= 500),
  spec text check (spec is null or char_length(spec) <= 20),
  doc uuid references app_users (id) on delete set null,
  status text not null default 'new' check (status in ('new', 'accepted', 'done')),
  doctor_id uuid references app_users (id) on delete set null,
  doctor_name text check (doctor_name is null or char_length(doctor_name) <= 200),
  call boolean not null default false,
  outcome int check (outcome between 0 and 2),
  created_at timestamptz not null default now()
);
create index if not exists app_consults_patient_idx on app_consults (patient_id);
create index if not exists app_consults_doctor_idx on app_consults (doctor_id);
create index if not exists app_consults_status_idx on app_consults (status);

create table if not exists app_messages (
  id bigint generated always as identity primary key,
  consult_id uuid not null references app_consults (id) on delete cascade,
  sender uuid references app_users (id) on delete set null,
  kind text not null check (kind in ('p', 'd', 's')),
  name text check (name is null or char_length(name) <= 200),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists app_messages_consult_idx on app_messages (consult_id);

-- Visit requests to a clinic: the patient picks a day and morning or afternoon, the clinic confirms the hour.
create table if not exists app_appts (
  id uuid primary key default gen_random_uuid(),
  n bigint generated always as identity (start with 5001),
  patient_id uuid not null references app_users (id) on delete cascade,
  clinic_id uuid not null references app_users (id) on delete cascade,
  clinic_name text not null check (char_length(clinic_name) between 1 and 200),
  fac text check (fac is null or char_length(fac) <= 40),
  day date not null,
  part text not null check (part in ('am', 'pm')),
  who text not null default 'self' check (who in ('self', 'other')),
  name text not null check (char_length(name) between 1 and 200),
  phone text not null check (phone ~ '^998[0-9]{9}$'),
  spec text check (spec is null or char_length(spec) <= 20),
  reason text check (reason is null or char_length(reason) <= 500),
  status text not null default 'new' check (status in ('new', 'confirmed', 'declined', 'cancelled')),
  appt_time text check (appt_time is null or appt_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  note text check (note is null or char_length(note) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists app_appts_patient_idx on app_appts (patient_id);
create index if not exists app_appts_clinic_idx on app_appts (clinic_id);

-- Added later; "add column if not exists" upgrades databases created before.
-- verified_at: an admin checked this clinic or doctor. For a clinic it covers the hospital in verified_fac only.
-- tg_chat: the Telegram chat that gets this user's notices, linked through tg_code (a one-hour code, stored hashed).
alter table app_users add column if not exists verified_at timestamptz;
alter table app_users add column if not exists verified_fac text;
alter table app_users add column if not exists tg_chat bigint;
alter table app_users add column if not exists tg_code text;
alter table app_users add column if not exists tg_code_at timestamptz;
create unique index if not exists app_users_tg_code_idx on app_users (tg_code);

alter table app_users enable row level security;
alter table app_sessions enable row level security;
alter table app_consults enable row level security;
alter table app_messages enable row level security;
alter table app_appts enable row level security;
`;
