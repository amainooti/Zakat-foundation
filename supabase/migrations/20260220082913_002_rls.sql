-- ============================================================
-- 002_rls.sql
-- Zakat Foundation of America — Row Level Security Policies
-- ============================================================
-- Admin identity is determined by app_metadata.user_role = 'admin'
-- This is set manually via the set_admin_role() function below
-- and is embedded in the JWT so RLS can read it without a DB lookup.
-- ============================================================

-- ── Helper: read role from JWT app_metadata ───────────────────
create or replace function is_admin()
returns boolean
language sql
stable
security definer
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin',
    false
  )
$$;

-- ── Helper: set admin role on a user (run once per admin) ─────
create or replace function set_admin_role(target_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb) ||
    '{"user_role": "admin"}'::jsonb
  where id = target_user_id;
end;
$$;

-- ============================================================
-- CAMPAIGNS
-- ============================================================
alter table campaigns enable row level security;

-- Public: read non-archived campaigns
create policy "campaigns_public_read"
  on campaigns
  for select
  using (status != 'archived');

-- Admin: full access
create policy "campaigns_admin_all"
  on campaigns
  for all
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- CAMPAIGN CONTRIBUTIONS
-- ============================================================
alter table campaign_contributions enable row level security;

-- Public: no direct read (amounts are surfaced via campaigns.raised_amount)
-- Webhook inserts via service role (bypasses RLS entirely)

-- Admin: full access
create policy "contributions_admin_all"
  on campaign_contributions
  for all
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- DONATIONS
-- ============================================================
alter table donations enable row level security;

-- Webhook (service role) bypasses RLS — no anon policy needed for insert
-- Admin: full access
create policy "donations_admin_all"
  on donations
  for all
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- BLOG POSTS
-- ============================================================
alter table blog_posts enable row level security;

-- Public: read published posts only
create policy "blog_public_read"
  on blog_posts
  for select
  using (published = true);

-- Admin: full access (can see drafts too)
create policy "blog_admin_all"
  on blog_posts
  for all
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- SITE SETTINGS
-- ============================================================
alter table site_settings enable row level security;

-- Public: read all settings (needed to render pages)
create policy "settings_public_read"
  on site_settings
  for select
  using (true);

-- Admin: full access
create policy "settings_admin_all"
  on site_settings
  for all
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================
alter table newsletter_subscribers enable row level security;

-- No public read or write — all inserts go through API route using service role
-- Admin: full access
create policy "newsletter_admin_all"
  on newsletter_subscribers
  for all
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- MEDIA
-- ============================================================
alter table media enable row level security;

-- Public: read all media (needed for images to render)
create policy "media_public_read"
  on media
  for select
  using (true);

-- Admin: full access
create policy "media_admin_all"
  on media
  for all
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- USAGE: After creating your admin user in Supabase Auth dashboard,
-- run this in the SQL editor (replace with real user id):
--
--   select set_admin_role('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
--
-- Then ask the user to sign out and back in so the JWT refreshes.
-- ============================================================