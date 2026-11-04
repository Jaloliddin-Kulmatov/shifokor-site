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

-- Reviews: only a patient whose consultation with the doctor is finished, or whose visit at the clinic was
-- confirmed and its day has come, can rate them, once per consultation or visit. Admins can hide a review.
create table if not exists app_reviews (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references app_users (id) on delete cascade,
  target_id uuid not null references app_users (id) on delete cascade,
  consult_id uuid unique references app_consults (id) on delete cascade,
  appt_id uuid unique references app_appts (id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  body text check (body is null or char_length(body) <= 600),
  author text not null default '' check (char_length(author) <= 60),
  hidden boolean not null default false,
  reply text check (reply is null or char_length(reply) <= 400),
  replied_at timestamptz,
  created_at timestamptz not null default now(),
  check (consult_id is not null or appt_id is not null)
);
create index if not exists app_reviews_target_idx on app_reviews (target_id);

-- Added later; "add column if not exists" upgrades databases created before.
-- verified_at: an admin checked this clinic or doctor. For a clinic it covers the hospital in verified_fac only.
-- tg_chat: the Telegram chat that gets this user's notices, linked through tg_code (a one-hour code, stored hashed).
alter table app_users add column if not exists verified_at timestamptz;
alter table app_users add column if not exists verified_fac text;
alter table app_users add column if not exists tg_chat bigint;
alter table app_users add column if not exists tg_code text;
alter table app_users add column if not exists tg_code_at timestamptz;
create unique index if not exists app_users_tg_code_idx on app_users (tg_code);
-- Doctors an admin imported, with their consent, from a list. They can't sign in until they open their invite link
-- (invite_hash: the link's code, stored hashed, valid 30 days from invite_at) and set a password (claimed_at).
alter table app_users add column if not exists imported_at timestamptz;
alter table app_users add column if not exists claimed_at timestamptz;
alter table app_users add column if not exists invite_hash text;
alter table app_users add column if not exists invite_at timestamptz;
create unique index if not exists app_users_invite_idx on app_users (invite_hash);

-- Photos in a consultation (a rash, a lab result). Only that consultation's patient and doctor can open them.
-- The browser shrinks each photo and strips its location data before upload, so one is at most 1.5 MB.
create table if not exists app_files (
  id uuid primary key default gen_random_uuid(),
  consult_id uuid not null references app_consults (id) on delete cascade,
  sender uuid references app_users (id) on delete set null,
  mime text not null check (mime in ('image/jpeg', 'image/png', 'image/webp')),
  data bytea not null check (octet_length(data) <= 1600000),
  created_at timestamptz not null default now()
);
create index if not exists app_files_consult_idx on app_files (consult_id);
alter table app_messages add column if not exists file_id uuid references app_files (id) on delete set null;
-- a photo message may have no text
do $$ begin
  if exists (select 1 from pg_constraint where conname = 'app_messages_body_check' and pg_get_constraintdef(oid) like '%>= 1%') then
    alter table app_messages drop constraint app_messages_body_check;
    alter table app_messages add constraint app_messages_body_check check (char_length(body) <= 2000);
  end if;
end $$;

-- Calls in an online consultation run straight between the two browsers (WebRTC). These are only the set-up
-- messages the server passes between the patient and the doctor; they're deleted after a few minutes.
-- call_at: when the doctor last started a call, so the patient sees it ringing and Telegram isn't spammed.
create table if not exists app_signals (
  id bigint generated always as identity primary key,
  consult_id uuid not null references app_consults (id) on delete cascade,
  sender uuid not null references app_users (id) on delete cascade,
  kind text not null check (kind in ('hello', 'offer', 'answer', 'bye')),
  body text not null default '' check (char_length(body) <= 20000),
  created_at timestamptz not null default now()
);
create index if not exists app_signals_consult_idx on app_signals (consult_id, id);
alter table app_consults add column if not exists call_at timestamptz;

-- Online payment for a consultation, through Payme or Click. The price is the doctor's price for that kind of
-- consultation when they accept it; the patient pays before the doctor replies or calls.
-- pay_status: none (free, or online payment not set up), due, paid, refunded.
alter table app_consults add column if not exists price int check (price is null or price >= 0);
alter table app_consults add column if not exists pay_status text not null default 'none' check (pay_status in ('none', 'due', 'paid', 'refunded'));
alter table app_consults add column if not exists paid_at timestamptz;
alter table app_consults add column if not exists pay_provider text;
-- One row per Payme or Click transaction, kept even if the consultation is deleted (payment records).
-- amount is in tiyin (1 so‘m = 100 tiyin). state follows Payme: 1 created, 2 paid, -1 cancelled, -2 refunded.
-- Times are milliseconds since 1970, as Payme expects them back.
create table if not exists app_payments (
  id uuid primary key default gen_random_uuid(),
  n bigint generated always as identity,
  consult_id uuid references app_consults (id) on delete set null,
  account text not null,
  provider text not null check (provider in ('payme', 'click')),
  ext_id text not null check (char_length(ext_id) <= 64),
  ext_time bigint,
  amount bigint not null check (amount > 0),
  state int not null default 1 check (state in (1, 2, -1, -2)),
  create_time bigint not null,
  perform_time bigint not null default 0,
  cancel_time bigint not null default 0,
  reason int,
  created_at timestamptz not null default now(),
  unique (provider, ext_id)
);
create index if not exists app_payments_consult_idx on app_payments (consult_id);
create index if not exists app_payments_time_idx on app_payments (provider, create_time);
-- Payme allows one unpaid transaction per consultation at a time
create unique index if not exists app_payments_open_payme_idx on app_payments (consult_id) where state = 1 and provider = 'payme';

-- Paying doctors. fee: the platform's share of a paid consultation (PLATFORM_FEE_PERCENT at the moment it was paid).
-- app_payouts: each transfer an admin made to a doctor; kept if the doctor's account is deleted.
alter table app_consults add column if not exists fee int check (fee is null or fee >= 0);
create table if not exists app_payouts (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references app_users (id) on delete set null,
  doctor_name text not null check (char_length(doctor_name) between 1 and 200),
  amount bigint not null check (amount > 0),
  paid_on date not null,
  ref text check (ref is null or char_length(ref) <= 100),
  note text check (note is null or char_length(note) <= 300),
  created_by uuid references app_users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists app_payouts_doctor_idx on app_payouts (doctor_id);

-- Added for care around a consultation:
-- referred: the doctor read the application and said an in-person visit is needed instead; nothing is charged.
-- closed_at: when it was finished or referred. followup_*: the "how are you feeling?" check two days later.
-- asap: the patient asked for the first available doctor.
do $$ begin
  if exists (select 1 from pg_constraint where conname = 'app_consults_status_check' and pg_get_constraintdef(oid) not like '%referred%') then
    alter table app_consults drop constraint app_consults_status_check;
    alter table app_consults add constraint app_consults_status_check check (status in ('new', 'accepted', 'done', 'referred'));
  end if;
end $$;
alter table app_consults add column if not exists closed_at timestamptz;
alter table app_consults add column if not exists followup_at timestamptz;
alter table app_consults add column if not exists followup text check (followup is null or followup in ('better', 'same', 'worse'));
alter table app_consults add column if not exists followup_answered_at timestamptz;
alter table app_consults add column if not exists asap boolean not null default false;
-- online_until: a doctor who said "I'm online now", until when. photo: the doctor's profile photo, a small JPEG.
alter table app_users add column if not exists online_until timestamptz;
alter table app_users add column if not exists photo bytea check (photo is null or octet_length(photo) <= 200000);
alter table app_users add column if not exists photo_at timestamptz;

-- Care for pregnant women and young mothers: a pregnancy profile, weekly check-ins, check-up reminders,
-- and a family member who hears about danger signs. Only the woman, her chosen doctor and that family member see it.
create table if not exists app_preg (
  user_id uuid primary key references app_users (id) on delete cascade,
  due_date date not null,
  born_on date,
  doctor_id uuid references app_users (id) on delete set null,
  family_name text check (family_name is null or char_length(family_name) <= 80),
  family_code text unique,
  family_code_at timestamptz,
  family_chat bigint,
  asked_at timestamptz,
  checked_at timestamptz,
  reminded_week int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists app_preg_doctor_idx on app_preg (doctor_id);
create table if not exists app_preg_checks (
  id bigint generated always as identity primary key,
  user_id uuid not null references app_users (id) on delete cascade,
  week int,
  signs text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists app_preg_checks_user_idx on app_preg_checks (user_id, created_at);

-- Voice messages in the consultation chat are stored like photos.
do $$ begin
  if exists (select 1 from pg_constraint where conname = 'app_files_mime_check' and pg_get_constraintdef(oid) not like '%audio/webm%') then
    alter table app_files drop constraint app_files_mime_check;
    alter table app_files add constraint app_files_mime_check check (mime in ('image/jpeg', 'image/png', 'image/webp', 'audio/webm', 'audio/ogg', 'audio/mp4'));
  end if;
end $$;
-- who started the call: 'd' (the doctor) or 'p' (the patient)
alter table app_consults add column if not exists call_by text check (call_by is null or call_by in ('d', 'p'));

-- A time the patient booked from the doctor's weekly hours (Tashkent time); one patient per doctor per time
-- while the application is open. slot_reminded: the Telegram reminder in the 24 hours before was sent.
alter table app_consults add column if not exists slot_at timestamptz;
alter table app_consults add column if not exists slot_reminded boolean not null default false;
create unique index if not exists app_consults_slot_uq on app_consults (doc, slot_at) where slot_at is not null and status in ('new', 'accepted');

-- the patient can cancel an application before a doctor accepts it
do $$ begin
  if exists (select 1 from pg_constraint where conname = 'app_consults_status_check' and pg_get_constraintdef(oid) not like '%cancelled%') then
    alter table app_consults drop constraint app_consults_status_check;
    alter table app_consults add constraint app_consults_status_check check (status in ('new', 'accepted', 'done', 'referred', 'cancelled'));
  end if;
end $$;

-- Medicines after a consultation: the doctor's list (rx) and the patient's requests for home delivery by a partner
-- pharmacy, which calls with the price and time; payment is on delivery.
alter table app_consults add column if not exists rx jsonb;
alter table app_consults add column if not exists rx_at timestamptz;
create table if not exists app_med_orders (
  id uuid primary key default gen_random_uuid(),
  consult_id uuid not null references app_consults (id) on delete cascade,
  patient_id uuid references app_users (id) on delete set null,
  patient_name text,
  rx jsonb not null,
  region text,
  address text not null check (char_length(address) <= 300),
  phone text not null,
  note text check (note is null or char_length(note) <= 300),
  status text not null default 'new' check (status in ('new', 'confirmed', 'on_way', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists app_med_orders_consult_idx on app_med_orders (consult_id);
create index if not exists app_med_orders_patient_idx on app_med_orders (patient_id);

-- Clinics with branches and staff (after SuperFlow's tenants, branches and specialists). A clinic invites a doctor
-- by phone; the doctor accepts in their panel (a doctor who isn't on Shifokor yet sees it after registering with
-- that number). The clinic sees its doctors' booked times, not the patients' details.
alter table app_users add column if not exists email_verified_at timestamptz;
-- a 6-digit code sent to confirm an account's email; only its hash is kept, for 30 minutes and 5 tries
create table if not exists app_email_codes (
  user_id uuid primary key references app_users (id) on delete cascade,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  tries int not null default 0,
  sent_at timestamptz not null default now()
);

create table if not exists app_branches (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references app_users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  region text,
  address text check (address is null or char_length(address) <= 300),
  phone text,
  hours text check (hours is null or char_length(hours) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists app_branches_clinic_idx on app_branches (clinic_id);
create table if not exists app_staff (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references app_users (id) on delete cascade,
  doctor_id uuid references app_users (id) on delete cascade,
  phone text not null,
  branch_id uuid references app_branches (id) on delete set null,
  status text not null default 'invited' check (status in ('invited', 'active')),
  created_at timestamptz not null default now(),
  answered_at timestamptz
);
create unique index if not exists app_staff_phone_uq on app_staff (clinic_id, phone);
create index if not exists app_staff_doctor_idx on app_staff (doctor_id);

-- Worker: jobs that run at a given time (reminders an hour before a booked consultation, and more later).
create table if not exists app_jobs (
  id bigint generated always as identity primary key,
  kind text not null,
  run_at timestamptz not null,
  payload jsonb not null default '{}',
  ref text,
  tries int not null default 0,
  last_error text,
  done_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists app_jobs_due_idx on app_jobs (run_at) where done_at is null;
create index if not exists app_jobs_ref_idx on app_jobs (kind, ref) where done_at is null;

alter table app_users enable row level security;
alter table app_sessions enable row level security;
alter table app_consults enable row level security;
alter table app_messages enable row level security;
alter table app_appts enable row level security;
alter table app_reviews enable row level security;
alter table app_files enable row level security;
alter table app_signals enable row level security;
alter table app_payments enable row level security;
alter table app_payouts enable row level security;
alter table app_preg enable row level security;
alter table app_preg_checks enable row level security;
alter table app_med_orders enable row level security;
alter table app_jobs enable row level security;
alter table app_branches enable row level security;
alter table app_staff enable row level security;
alter table app_email_codes enable row level security;
`;
