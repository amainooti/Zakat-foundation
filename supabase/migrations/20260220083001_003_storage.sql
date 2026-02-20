-- ============================================================
-- 003_storage.sql
-- Zakat Foundation of America — Storage Bucket + Policies
-- ============================================================
-- Run this AFTER creating the 'zfa-media' bucket in the
-- Supabase dashboard (Storage → New Bucket → public: true)
-- OR let this script create it via the storage API.
-- ============================================================

-- ── Create bucket (idempotent) ────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'zfa-media',
  'zfa-media',
  true,                              -- public: URLs are readable without auth
  10485760,                          -- 10 MB max per file
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ]
)
on conflict (id) do nothing;

-- ============================================================
-- STORAGE POLICIES
-- storage.objects RLS — controls who can upload/delete
-- ============================================================

-- ── Public: read any object in zfa-media ─────────────────────
create policy "zfa_media_public_read"
  on storage.objects
  for select
  using (bucket_id = 'zfa-media');

-- ── Admin: upload (insert) ────────────────────────────────────
create policy "zfa_media_admin_insert"
  on storage.objects
  for insert
  with check (
    bucket_id = 'zfa-media'
    and is_admin()
  );

-- ── Admin: update (replace / rename) ─────────────────────────
create policy "zfa_media_admin_update"
  on storage.objects
  for update
  using (
    bucket_id = 'zfa-media'
    and is_admin()
  );

-- ── Admin: delete ─────────────────────────────────────────────
create policy "zfa_media_admin_delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'zfa-media'
    and is_admin()
  );

-- ============================================================
-- STORAGE FOLDER CONVENTIONS
-- All uploads should follow this path structure:
--
--   campaigns/{campaign-slug}/{filename}
--   blog/{post-slug}/{filename}
--   site/{key}/{filename}         ← logo, hero images, partner logos
--   misc/{filename}               ← one-off uploads from media library
--
-- Public URL pattern:
--   {SUPABASE_URL}/storage/v1/object/public/zfa-media/{path}
-- ============================================================