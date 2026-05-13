-- ============================================================
-- FIX: Replace auth.uid() RLS policies
--
-- App uses custom cookie-based JWT (NOT Supabase Auth).
-- auth.uid() is always NULL with anon key + no Supabase Auth,
-- so all auth.uid() policies silently block every operation.
--
-- New pattern:
--   - service_role client handles all authenticated writes
--     (service_role bypasses RLS entirely — no policies needed)
--   - anon client handles public reads only
-- ============================================================

-- Drop all broken auth.uid() policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

DROP POLICY IF EXISTS "Users can view own repositories" ON repositories;
DROP POLICY IF EXISTS "Users can insert own repositories" ON repositories;
DROP POLICY IF EXISTS "Users can update own repositories" ON repositories;
DROP POLICY IF EXISTS "Users can delete own repositories" ON repositories;

DROP POLICY IF EXISTS "Users can manage own changelogs" ON changelogs;

DROP POLICY IF EXISTS "Users can view own commits cache" ON commits_cache;
DROP POLICY IF EXISTS "Users can insert own commits cache" ON commits_cache;
DROP POLICY IF EXISTS "Users can update own commits cache" ON commits_cache;

DROP POLICY IF EXISTS "Users can view own api usage" ON api_usage;
DROP POLICY IF EXISTS "Users can insert own api usage" ON api_usage;

-- ============================================================
-- repositories: anon SELECT for public changelog pages
-- (public changelog page joins changelogs + repositories
--  without any auth context)
-- ============================================================
CREATE POLICY "Allow public read on repositories"
  ON repositories FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- changelogs: anon UPDATE for view_count increment
-- (public pages increment view_count — no user auth involved)
-- Scoped to published changelogs only.
-- ============================================================
CREATE POLICY "Allow public update view count on changelogs"
  ON changelogs FOR UPDATE
  TO anon
  USING (is_published = TRUE)
  WITH CHECK (is_published = TRUE);

-- "Anyone can view published changelogs" policy from migration 001
-- remains in place — no change needed there.

-- users, commits_cache, api_usage: no anon policies.
-- All access goes through service_role client which bypasses RLS.
