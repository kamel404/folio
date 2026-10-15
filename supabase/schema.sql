-- ═══════════════════════════════════════════════════════════════════════════
-- FOLIO — multi-tenant schema
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS.
--
-- Differences from the plan's draft (see folio_implementation_plan.md → Database Schema):
--   • gen_random_uuid() instead of uuid_generate_v4() (built in, no extension)
--   • tenants.plan defaults to 'none' — there is no free tier
--   • Public read policies only expose tenants that have an active paid plan
--   • Tenants/subscriptions/ai_usage can't be edited by the user (no self-upgrade)
--   • A trigger creates tenant + profile + theme row when someone signs up
-- ═══════════════════════════════════════════════════════════════════════════


-- ─── Tables ────────────────────────────────────────────────────────────────

create table if not exists public.tenants (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid unique not null references auth.users(id) on delete cascade,
  slug          text unique not null,                       -- subdomain: slug.getfolio.dev
  custom_domain text unique,                                -- Pro: yourdomain.com
  plan          text not null default 'none',               -- none | starter | pro
  onboarding    text not null default 'pending',            -- pending | in_progress | completed
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'),
  constraint plan_values check (plan in ('none', 'starter', 'pro')),
  constraint onboarding_values check (onboarding in ('pending', 'in_progress', 'completed'))
);
create index if not exists idx_tenants_custom_domain on public.tenants(custom_domain) where custom_domain is not null;

create table if not exists public.profiles (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid unique not null references public.tenants(id) on delete cascade,
  name                text not null,
  title               text not null default 'Software Developer',
  short_bio           text,
  long_bio            text,
  email               text,
  phone               text,
  linkedin_url        text,
  github_url          text,
  cv_url              text,
  profile_image_url   text,
  location            text,
  availability_status text,
  updated_at          timestamptz not null default now()
);

create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  title             text not null,
  slug              text not null,
  short_description text not null,
  description       text,
  image_url         text,
  github_url        text,
  live_url          text,
  category          text not null default 'Web Application',
  featured          boolean not null default false,
  published         boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (tenant_id, slug)
);
create index if not exists idx_projects_tenant on public.projects(tenant_id);

create table if not exists public.technologies (
  id       uuid primary key default gen_random_uuid(),
  name     text unique not null,
  category text
);

create table if not exists public.project_technologies (
  project_id    uuid references public.projects(id) on delete cascade,
  technology_id uuid references public.technologies(id) on delete cascade,
  primary key (project_id, technology_id)
);

create table if not exists public.experiences (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  company     text not null,
  position    text not null,
  description text not null,
  start_date  text not null,
  end_date    text,
  current     boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_experiences_tenant on public.experiences(tenant_id);

create table if not exists public.skills (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  name       text not null,
  category   text not null,
  sort_order integer not null default 0
);
create index if not exists idx_skills_tenant on public.skills(tenant_id);

create table if not exists public.theme_configs (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid unique not null references public.tenants(id) on delete cascade,
  palette_id     text not null default 'warm-earth',
  custom_colors  jsonb,
  font_heading   text default 'Inter',
  font_body      text default 'Inter',
  layout_variant text default 'classic',
  show_photo     boolean default true,
  updated_at     timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid unique not null references public.tenants(id) on delete cascade,
  ls_subscription_id   text,
  ls_customer_id       text,
  plan                 text not null default 'none',
  status               text not null default 'active',       -- active | cancelled | past_due | expired
  current_period_start timestamptz,
  current_period_end   timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table if not exists public.ai_usage (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  action     text not null,                                   -- cv_parse | generate | rewrite | score
  tokens_in  integer default 0,
  tokens_out integer default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_usage_tenant on public.ai_usage(tenant_id, created_at);

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role    text not null default 'admin'                       -- admin | super_admin
);


-- ─── Helper functions (SECURITY DEFINER avoids RLS recursion) ──────────────

create or replace function public.owns_tenant(tid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.tenants where id = tid and user_id = auth.uid());
$$;

-- A tenant's public content is visible only while it has a paid plan and is active.
create or replace function public.tenant_is_live(tid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.tenants where id = tid and plan <> 'none' and active);
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['tenants','profiles','projects','experiences','theme_configs','subscriptions'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t);
  end loop;
end $$;


-- ─── Signup trigger: tenant + profile + theme ──────────────────────────────
-- The signup form sends { full_name, slug } as user metadata. Doing this in the
-- database means it works even when email confirmation is on (no session yet).
-- If the slug is invalid/reserved/taken the insert fails and signup is rejected.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_slug   text := lower(trim(coalesce(new.raw_user_meta_data->>'slug', '')));
  v_name   text := trim(coalesce(new.raw_user_meta_data->>'full_name', ''));
  v_tenant uuid;
begin
  if v_slug !~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$' then
    raise exception 'invalid_slug';
  end if;
  if v_slug = any (array[
    'www','app','api','admin','dashboard','mail','smtp','ftp','blog','docs','help',
    'support','status','cdn','assets','staging','dev','test','beta','demo',
    'folio','getfolio','login','signup','pricing','sites'
  ]) then
    raise exception 'reserved_slug';
  end if;

  insert into public.tenants (user_id, slug) values (new.id, v_slug) returning id into v_tenant;
  insert into public.profiles (tenant_id, name, email)
    values (v_tenant, coalesce(nullif(v_name, ''), split_part(new.email, '@', 1)), new.email);
  insert into public.theme_configs (tenant_id) values (v_tenant);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ─── Row Level Security ────────────────────────────────────────────────────

alter table public.tenants              enable row level security;
alter table public.profiles             enable row level security;
alter table public.projects             enable row level security;
alter table public.technologies         enable row level security;
alter table public.project_technologies enable row level security;
alter table public.experiences          enable row level security;
alter table public.skills               enable row level security;
alter table public.theme_configs        enable row level security;
alter table public.subscriptions        enable row level security;
alter table public.ai_usage             enable row level security;
alter table public.platform_admins      enable row level security;

-- tenants: owner can read their row and change ONLY `onboarding`.
-- plan / slug / active / custom_domain change through server code (service role) only.
drop policy if exists owner_select_tenant on public.tenants;
create policy owner_select_tenant on public.tenants for select to authenticated
  using (user_id = auth.uid());

drop policy if exists owner_update_tenant on public.tenants;
create policy owner_update_tenant on public.tenants for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke insert, update, delete on public.tenants from anon, authenticated;
grant update (onboarding) on public.tenants to authenticated;

-- profiles / projects / experiences / skills / theme_configs:
--   owner: full access · public: read only while the tenant is live
do $$
declare t text;
begin
  foreach t in array array['profiles','projects','experiences','skills','theme_configs'] loop
    execute format('drop policy if exists owner_all_%1$s on public.%1$I', t);
    execute format('create policy owner_all_%1$s on public.%1$I for all to authenticated
                    using (public.owns_tenant(tenant_id)) with check (public.owns_tenant(tenant_id))', t);
    execute format('drop policy if exists public_read_%1$s on public.%1$I', t);
  end loop;
end $$;

create policy public_read_profiles    on public.profiles      for select to anon, authenticated
  using (public.tenant_is_live(tenant_id));
create policy public_read_projects    on public.projects      for select to anon, authenticated
  using (published and public.tenant_is_live(tenant_id));
create policy public_read_experiences on public.experiences   for select to anon, authenticated
  using (public.tenant_is_live(tenant_id));
create policy public_read_skills      on public.skills        for select to anon, authenticated
  using (public.tenant_is_live(tenant_id));
create policy public_read_theme_configs on public.theme_configs for select to anon, authenticated
  using (public.tenant_is_live(tenant_id));

-- project_technologies follows its project
drop policy if exists owner_all_project_technologies on public.project_technologies;
create policy owner_all_project_technologies on public.project_technologies for all to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and public.owns_tenant(p.tenant_id)))
  with check (exists (select 1 from public.projects p where p.id = project_id and public.owns_tenant(p.tenant_id)));

drop policy if exists public_read_project_technologies on public.project_technologies;
create policy public_read_project_technologies on public.project_technologies for select to anon, authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.published and public.tenant_is_live(p.tenant_id)));

-- technologies: shared lookup table, readable by everyone, written via service role
drop policy if exists public_read_technologies on public.technologies;
create policy public_read_technologies on public.technologies for select to anon, authenticated using (true);

-- subscriptions / ai_usage: owner can read; only the server (service role) writes
drop policy if exists owner_select_subscription on public.subscriptions;
create policy owner_select_subscription on public.subscriptions for select to authenticated
  using (public.owns_tenant(tenant_id));
revoke insert, update, delete on public.subscriptions from anon, authenticated;

drop policy if exists owner_select_ai_usage on public.ai_usage;
create policy owner_select_ai_usage on public.ai_usage for select to authenticated
  using (public.owns_tenant(tenant_id));
revoke insert, update, delete on public.ai_usage from anon, authenticated;

-- platform_admins: no policies → only the service role can read/write


-- ─── Storage: portfolio-images/{tenant_id}/… ───────────────────────────────

insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

drop policy if exists tenant_upload on storage.objects;
create policy tenant_upload on storage.objects for insert to authenticated
  with check (
    bucket_id = 'portfolio-images'
    and (storage.foldername(name))[1] in (select id::text from public.tenants where user_id = auth.uid())
  );

drop policy if exists tenant_update_own_files on storage.objects;
create policy tenant_update_own_files on storage.objects for update to authenticated
  using (
    bucket_id = 'portfolio-images'
    and (storage.foldername(name))[1] in (select id::text from public.tenants where user_id = auth.uid())
  );

drop policy if exists tenant_delete_own_files on storage.objects;
create policy tenant_delete_own_files on storage.objects for delete to authenticated
  using (
    bucket_id = 'portfolio-images'
    and (storage.foldername(name))[1] in (select id::text from public.tenants where user_id = auth.uid())
  );

drop policy if exists public_read_images on storage.objects;
create policy public_read_images on storage.objects for select
  using (bucket_id = 'portfolio-images');
