-- Shifokor: accounts (patients, doctors, clinics), consultation applications and their messages.
-- Test pilot only: Supabase cloud regions are outside Uzbekistan, so no real patient data.

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'patient' check (role in ('patient', 'doctor', 'clinic')),
  name text not null check (char_length(name) between 1 and 200),
  phone text check (phone is null or char_length(phone) <= 20),
  tg text check (tg is null or char_length(tg) <= 40),
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Doctor and clinic profiles are public; own profile is visible"
  on public.profiles for select to anon, authenticated
  using (role in ('doctor', 'clinic') or (select auth.uid()) = id);

create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- role and id never change after sign-up
create function public.profiles_guard() returns trigger
  language plpgsql set search_path = '' as $$
begin
  new.id := old.id;
  new.role := old.role;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end $$;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.profiles_guard();

-- a profile row is created for every new account, from the sign-up form's metadata
create function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = '' as $$
declare
  r text := coalesce(new.raw_user_meta_data ->> 'role', 'patient');
begin
  if r not in ('patient', 'doctor', 'clinic') then r := 'patient'; end if;
  insert into public.profiles (id, role, name, phone, tg, profile)
  values (
    new.id, r,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)), 200),
    case when r = 'doctor' then null else left(nullif(new.raw_user_meta_data ->> 'phone', ''), 20) end,
    left(nullif(new.raw_user_meta_data ->> 'tg', ''), 40),
    case r
      when 'doctor' then '{"spec":"gp","modes":["in"],"langs":["uz"],"work":[],"svc":[]}'::jsonb
      when 'clinic' then '{"ctype":"clinic","own":"s","svc":[]}'::jsonb
      else '{}'::jsonb
    end
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_doctor() returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'doctor')
$$;

-- ---------- consultation applications ----------
create table public.consults (
  id uuid primary key default gen_random_uuid(),
  n bigint generated always as identity (start with 1001),
  patient_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
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
  doc uuid references public.profiles (id) on delete set null,
  status text not null default 'new' check (status in ('new', 'accepted', 'done')),
  doctor_id uuid references public.profiles (id) on delete set null,
  doctor_name text check (doctor_name is null or char_length(doctor_name) <= 200),
  call boolean not null default false,
  outcome int check (outcome between 0 and 2),
  created_at timestamptz not null default now()
);
create index consults_patient_idx on public.consults (patient_id);
create index consults_doctor_idx on public.consults (doctor_id);
create index consults_doc_idx on public.consults (doc);
create index consults_status_idx on public.consults (status);
alter table public.consults enable row level security;

create policy "Patients see their own applications; doctors see open ones and their own"
  on public.consults for select to authenticated
  using (
    patient_id = (select auth.uid())
    or doctor_id = (select auth.uid())
    or (status = 'new' and (select public.is_doctor()) and (doc is null or doc = (select auth.uid())))
  );

create policy "Signed-in patients create applications for themselves"
  on public.consults for insert to authenticated
  with check (patient_id = (select auth.uid()) and status = 'new' and doctor_id is null and call = false and outcome is null);

create policy "Doctors accept open applications and update their own"
  on public.consults for update to authenticated
  using (
    (status = 'new' and (select public.is_doctor()) and (doc is null or doc = (select auth.uid())))
    or doctor_id = (select auth.uid())
  )
  with check (doctor_id = (select auth.uid()));

-- doctors may only change the consultation's progress, never what the patient wrote
create function public.consults_guard() returns trigger
  language plpgsql set search_path = '' as $$
begin
  new.id := old.id; new.n := old.n; new.patient_id := old.patient_id; new.created_at := old.created_at;
  new.type := old.type; new.who := old.who; new.name := old.name; new.age := old.age; new.sex := old.sex;
  new.phone := old.phone; new.region := old.region; new.district := old.district; new.complaint := old.complaint;
  new.since := old.since; new.chronic := old.chronic; new.meds := old.meds; new.allergy := old.allergy;
  new.spec := old.spec; new.doc := old.doc;
  if old.status = 'done' then new.status := 'done'; new.outcome := old.outcome; end if;
  return new;
end $$;
create trigger consults_guard before update on public.consults
  for each row execute function public.consults_guard();

-- ---------- messages ----------
create table public.consult_messages (
  id bigint generated always as identity primary key,
  consult_id uuid not null references public.consults (id) on delete cascade,
  sender uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('p', 'd', 's')),
  name text check (name is null or char_length(name) <= 200),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index consult_messages_consult_idx on public.consult_messages (consult_id);
create index consult_messages_sender_idx on public.consult_messages (sender);
alter table public.consult_messages enable row level security;

create function public.can_see_consult(cid uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.consults c
    where c.id = cid and (
      c.patient_id = (select auth.uid())
      or c.doctor_id = (select auth.uid())
      or (c.status = 'new' and public.is_doctor() and (c.doc is null or c.doc = (select auth.uid())))
    )
  )
$$;

create policy "Participants read messages"
  on public.consult_messages for select to authenticated
  using ((select public.can_see_consult(consult_id)));

create policy "Participants write messages"
  on public.consult_messages for insert to authenticated
  with check (
    sender = (select auth.uid())
    and (select public.can_see_consult(consult_id))
    and (kind <> 'd' or (select public.is_doctor()))
  );

-- ---------- account deletion ----------
create function public.delete_my_account() returns void
  language plpgsql security definer set search_path = '' as $$
begin
  delete from auth.users where id = (select auth.uid());
end $$;

-- ---------- function permissions ----------
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.profiles_guard() from public, anon, authenticated;
revoke execute on function public.consults_guard() from public, anon, authenticated;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
revoke execute on function public.is_doctor() from public, anon;
grant execute on function public.is_doctor() to authenticated;
revoke execute on function public.can_see_consult(uuid) from public, anon;
grant execute on function public.can_see_consult(uuid) to authenticated;

-- ---------- live updates for the consultation chat ----------
alter publication supabase_realtime add table public.consults, public.consult_messages;
