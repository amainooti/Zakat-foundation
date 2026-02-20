-- ============================================================
-- 001_schema.sql
-- Zakat Foundation of America — Full Schema
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for text search on campaigns/blog

-- ============================================================
-- CAMPAIGNS
-- ============================================================
create table campaigns (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  subtitle       text,
  description    text,                          -- Tiptap HTML
  cover_image    text,                          -- Supabase Storage URL
  location       text,
  status         text not null default 'active'
                   check (status in ('active', 'urgent', 'completed', 'archived')),
  category       text,                          -- e.g. 'Medical', 'Education', 'Yemen'
  tags           text[]        default '{}',
  target_amount  numeric(12,2) not null check (target_amount > 0),
  raised_amount  numeric(12,2) not null default 0 check (raised_amount >= 0),
  donor_count    integer       not null default 0,
  is_featured    boolean       not null default false,
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now()
);

create index idx_campaigns_status    on campaigns (status);
create index idx_campaigns_category  on campaigns (category);
create index idx_campaigns_featured  on campaigns (is_featured) where is_featured = true;
create index idx_campaigns_slug      on campaigns (slug);

-- ============================================================
-- CAMPAIGN CONTRIBUTIONS
-- Append-only log — trigger recomputes campaign totals on insert
-- ============================================================
create table campaign_contributions (
  id                uuid        primary key default gen_random_uuid(),
  campaign_id       uuid        not null references campaigns (id) on delete cascade,
  amount            numeric(10,2) not null check (amount > 0),
  currency          text        not null default 'USD',
  source            text        not null default 'manual'
                      check (source in ('manual', 'paystack')),
  note              text,                        -- admin note for manual entries
  donor_name        text,
  donor_email       text,
  paystack_ref      text unique,                 -- Paystack payment reference
  created_at        timestamptz not null default now()
);

create index idx_contributions_campaign on campaign_contributions (campaign_id);
create index idx_contributions_source   on campaign_contributions (source);

-- ── Trigger: recompute raised_amount + donor_count after each insert ──
create or replace function update_campaign_totals()
returns trigger
language plpgsql
security definer
as $$
begin
  update campaigns
  set
    raised_amount = (
      select coalesce(sum(amount), 0)
      from campaign_contributions
      where campaign_id = NEW.campaign_id
    ),
    donor_count = (
      select count(*)
      from campaign_contributions
      where campaign_id = NEW.campaign_id
        and source = 'paystack'
    ),
    updated_at = now()
  where id = NEW.campaign_id;
  return NEW;
end;
$$;

create trigger trg_update_campaign_totals
  after insert on campaign_contributions
  for each row
  execute function update_campaign_totals();

-- ============================================================
-- DONATIONS
-- Paystack-originated public donations (written by webhook)
-- ============================================================
create table donations (
  id               uuid        primary key default gen_random_uuid(),
  campaign_id      uuid        references campaigns (id) on delete set null,
  paystack_ref     text        unique not null,
  paystack_plan_id text,                        -- for recurring subscriptions
  donor_name       text,
  donor_email      text,
  amount           numeric(10,2) not null,
  currency         text        not null default 'USD',
  is_recurring     boolean     not null default false,
  status           text        not null default 'pending'
                     check (status in ('pending', 'completed', 'failed', 'refunded')),
  receipt_sent     boolean     not null default false,
  newsletter_opt_in boolean    not null default false,
  metadata         jsonb,                        -- raw Paystack payload snapshot
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_donations_campaign    on donations (campaign_id);
create index idx_donations_status      on donations (status);
create index idx_donations_email       on donations (donor_email);
create index idx_donations_created_at  on donations (created_at desc);
create index idx_donations_recurring   on donations (is_recurring) where is_recurring = true;

-- ============================================================
-- BLOG POSTS
-- ============================================================
create table blog_posts (
  id           uuid        primary key default gen_random_uuid(),
  slug         text        unique not null,
  title        text        not null,
  excerpt      text,
  content      text,                            -- Tiptap HTML
  cover_image  text,
  category     text,
  tags         text[]      default '{}',
  published    boolean     not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_blog_published  on blog_posts (published) where published = true;
create index idx_blog_slug       on blog_posts (slug);
create index idx_blog_category   on blog_posts (category);
create index idx_blog_created_at on blog_posts (created_at desc);

-- ── Auto-set published_at when post is first published ──
create or replace function set_published_at()
returns trigger
language plpgsql
as $$
begin
  if NEW.published = true and OLD.published = false then
    NEW.published_at = now();
  end if;
  return NEW;
end;
$$;

create trigger trg_blog_published_at
  before update on blog_posts
  for each row
  execute function set_published_at();

-- ============================================================
-- SITE SETTINGS
-- Key-value store — controls all editable public content
-- ============================================================
create table site_settings (
  key        text primary key,
  value      text,
  type       text not null default 'text'
               check (type in ('text', 'richtext', 'image', 'boolean', 'json'))
);

-- ── Seed all editable site content keys ──
insert into site_settings (key, value, type) values
  -- Global
  ('site_name',                   'Zakat Foundation of America',  'text'),
  ('logo_url',                    '',                             'image'),
  ('favicon_url',                 '',                             'image'),

  -- Navbar
  ('nav_cta_label',               'Donate Now',                   'text'),
  ('nav_cta_href',                '/donate',                      'text'),

  -- Homepage — Featured Campaigns section
  ('home_campaigns_heading',      'Current Active Campaigns',     'text'),
  ('home_campaigns_subheading',   'Support those who need it most today.', 'text'),

  -- Homepage — Stats bar
  ('home_stats_1_label',          'Countries Served',             'text'),
  ('home_stats_1_value',          '12',                           'text'),
  ('home_stats_2_label',          'Total Raised',                 'text'),
  ('home_stats_2_value',          '$2,000,000',                   'text'),
  ('home_stats_3_label',          'Families Helped',              'text'),
  ('home_stats_3_value',          '8,400',                        'text'),
  ('home_stats_4_label',          'Years of Service',             'text'),
  ('home_stats_4_value',          '25',                           'text'),

  -- Homepage — Donation CTA banner
  ('home_cta_heading',            'Your Zakat Changes Lives',     'text'),
  ('home_cta_body',               'Every dollar goes directly to those in need. No overhead, no delays.', 'text'),
  ('home_cta_button_label',       'Give Now',                     'text'),
  ('home_cta_button_href',        '/donate',                      'text'),
  ('home_cta_image',              '',                             'image'),

  -- Homepage — Blog preview
  ('home_blog_heading',           'Stories from the Field',       'text'),

  -- Homepage — Partners strip
  ('home_partners_heading',       'Our Partners',                 'text'),
  ('home_partners_logos',         '[]',                           'json'),

  -- About page
  ('about_heading',               'Who We Are',                   'text'),
  ('about_subheading',            '',                             'text'),
  ('about_body',                  '',                             'richtext'),
  ('about_image',                 '',                             'image'),
  ('about_values_heading',        'Our Values',                   'text'),
  ('about_values',                '[]',                           'json'),

  -- Donate page
  ('donate_heading',              'Make a Difference Today',      'text'),
  ('donate_intro',                '',                             'richtext'),
  ('donate_preset_amounts',       '[10,25,50,100,250,500]',       'json'),

  -- Footer
  ('footer_tagline',              'Providing humanitarian aid to those displaced by conflict.', 'text'),
  ('footer_address',              '',                             'text'),
  ('footer_email',                '',                             'text'),
  ('footer_phone',                '',                             'text'),
  ('footer_social_twitter',       '',                             'text'),
  ('footer_social_instagram',     '',                             'text'),
  ('footer_social_facebook',      '',                             'text'),
  ('footer_social_youtube',       '',                             'text');

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================
create table newsletter_subscribers (
  id          uuid        primary key default gen_random_uuid(),
  email       text        unique not null,
  name        text,
  subscribed  boolean     not null default true,
  source      text        not null default 'donate'
                check (source in ('donate', 'footer', 'manual')),
  created_at  timestamptz not null default now()
);

create index idx_newsletter_email      on newsletter_subscribers (email);
create index idx_newsletter_subscribed on newsletter_subscribers (subscribed)
  where subscribed = true;

-- ============================================================
-- MEDIA LIBRARY
-- ============================================================
create table media (
  id          uuid        primary key default gen_random_uuid(),
  filename    text        not null,
  url         text        not null,
  bucket      text        not null default 'zfa-media',
  mime_type   text,
  size_bytes  integer,
  alt_text    text,
  created_at  timestamptz not null default now()
);

create index idx_media_created_at on media (created_at desc);
create index idx_media_mime_type  on media (mime_type);

-- ============================================================
-- updated_at auto-refresh triggers
-- ============================================================
create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

create trigger trg_campaigns_updated_at
  before update on campaigns
  for each row execute function touch_updated_at();

create trigger trg_donations_updated_at
  before update on donations
  for each row execute function touch_updated_at();

create trigger trg_blog_updated_at
  before update on blog_posts
  for each row execute function touch_updated_at();