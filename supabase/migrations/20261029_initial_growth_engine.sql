create extension if not exists pgcrypto;

create type public.acquisition_channel as enum (
  'College Communities', 'Student Ambassadors', 'Direct Outreach'
);

create table public.ambassadors (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 2 and 100),
  college text not null check (char_length(college) between 2 and 200),
  referral_code text not null unique check (referral_code ~ '^[A-Z0-9]{3,16}$'),
  is_active boolean not null default true,
  target integer not null default 15 check (target between 1 and 200),
  created_at timestamptz not null default now()
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text not null unique check (email = lower(trim(email))),
  college text not null check (char_length(college) between 2 and 200),
  branch text not null check (char_length(branch) between 2 and 100),
  graduation_year integer not null check (graduation_year between 2024 and 2030),
  acquisition_channel public.acquisition_channel not null,
  referral_code text references public.ambassadors(referral_code),
  attribution_source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  consent_timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index registrations_created_at_idx on public.registrations (created_at desc);
create index registrations_channel_idx on public.registrations (acquisition_channel);
create index registrations_referral_code_idx on public.registrations (referral_code);

create table public.campaign_settings (
  id boolean primary key default true check (id),
  campaign_name text not null,
  registration_goal integer not null check (registration_goal > 0),
  campaign_start_date date not null,
  campaign_end_date date not null check (campaign_end_date >= campaign_start_date),
  total_budget numeric(12,2) not null check (total_budget >= 0),
  workshop_date date,
  workshop_time time,
  updated_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  description text not null,
  planned_amount numeric(12,2) not null check (planned_amount >= 0),
  actual_amount numeric(12,2) not null check (actual_amount >= 0),
  status text not null check (status in ('planned', 'approved', 'spent', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  description text not null,
  source text,
  referral_code text,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.ambassadors enable row level security;
alter table public.registrations enable row level security;
alter table public.campaign_settings enable row level security;
alter table public.expenses enable row level security;
alter table public.campaign_events enable row level security;
alter table public.profiles enable row level security;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select coalesce((select is_admin from public.profiles where id = auth.uid()), false) $$;

create policy "admins manage ambassadors" on public.ambassadors for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read registrations" on public.registrations for select using (public.is_admin());
create policy "admins manage settings" on public.campaign_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage expenses" on public.expenses for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read events" on public.campaign_events for select using (public.is_admin());
create policy "users read own profile" on public.profiles for select using (id = auth.uid());

create function public.is_active_referral(p_referral_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.ambassadors where referral_code = upper(trim(p_referral_code)) and is_active) $$;

create function public.register_workshop(
  p_full_name text,
  p_email text,
  p_college text,
  p_branch text,
  p_graduation_year integer,
  p_referral_code text default null,
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null
)
returns table (outcome text, registration_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(p_email));
  valid_referral text;
  new_id uuid;
begin
  if normalized_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'invalid_email';
  end if;
  if char_length(trim(p_full_name)) < 2 or char_length(trim(p_college)) < 2 or char_length(trim(p_branch)) < 2 or p_graduation_year not between 2024 and 2030 then
    raise exception 'invalid_registration';
  end if;
  if exists (select 1 from public.registrations where email = normalized_email) then
    return query select 'duplicate'::text, null::uuid;
    return;
  end if;
  if p_referral_code is not null then
    select referral_code into valid_referral from public.ambassadors where referral_code = upper(trim(p_referral_code)) and is_active;
    if valid_referral is null then
      return query select 'invalid_referral'::text, null::uuid;
      return;
    end if;
  end if;
  insert into public.registrations (full_name, email, college, branch, graduation_year, acquisition_channel, referral_code, attribution_source, utm_source, utm_medium, utm_campaign)
  values (trim(p_full_name), normalized_email, trim(p_college), trim(p_branch), p_graduation_year,
    case when valid_referral is not null then 'Student Ambassadors'::public.acquisition_channel
      when p_utm_medium = 'community' or coalesce(p_utm_source, '') ilike '%community%' then 'College Communities'::public.acquisition_channel
      else 'Direct Outreach'::public.acquisition_channel end,
    valid_referral, case when valid_referral is not null then 'ambassador:' || valid_referral else null end,
    nullif(trim(p_utm_source), ''), nullif(trim(p_utm_medium), ''), nullif(trim(p_utm_campaign), ''))
  returning id into new_id;
  insert into public.campaign_events (event_type, description, source, referral_code)
  values ('registration', 'Registration recorded', p_utm_source, valid_referral);
  return query select 'registered'::text, new_id;
end;
$$;

revoke all on function public.register_workshop(text, text, text, text, integer, text, text, text, text) from public;
grant execute on function public.register_workshop(text, text, text, text, integer, text, text, text, text) to anon, authenticated;
grant execute on function public.is_active_referral(text) to anon, authenticated;
