/*
# Adjust RLS policies to single-tenant (no auth UI)

1. Context
   - Module 01 ships WITHOUT a sign-in/sign-up screen, per the user's scope.
   - The frontend therefore runs as the `anon` role for the entire session.
   - The previously-applied policies were scoped `TO authenticated` only,
     which means the anon-key client would receive zero rows and every write
     would silently fail. This migration corrects that.

2. Changes
   - Replaces all policies on `users`, `careers`, and `career_settings` with
     `TO anon, authenticated` equivalents so the single-player app can read
     and write its own data.
   - `careers.user_id` is no longer defaulted to `auth.uid()` — it is nullable
     and set client-side to a stable local identifier when there is no session.
     To avoid a breaking type change, the column remains NOT NULL with a
     default of a generated UUID, so inserts that omit user_id still succeed.

3. Security
   - This is a single-tenant app (no sign-in). The data is intentionally
     shared/public on this instance, so `USING (true)` is acceptable here.
   - When a future module adds authentication, these policies should be
     replaced with owner-scoped `TO authenticated` policies and the auth UI
     must be built in the same change.

4. Idempotent
   - Uses DROP POLICY IF EXISTS before each CREATE POLICY.
   - No destructive table/column operations.
*/

-- ---------- careers: relax user_id default (no auth session available) ----------
ALTER TABLE careers ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE careers ALTER COLUMN user_id SET DEFAULT gen_random_uuid();

-- ---------- users policies ----------
DROP POLICY IF EXISTS "select_own_user" ON users;
DROP POLICY IF EXISTS "insert_own_user" ON users;
DROP POLICY IF EXISTS "update_own_user" ON users;
DROP POLICY IF EXISTS "delete_own_user" ON users;

CREATE POLICY "select_users" ON users FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_users" ON users FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_users" ON users FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_users" ON users FOR DELETE
  TO anon, authenticated USING (true);

-- ---------- careers policies ----------
DROP POLICY IF EXISTS "select_own_careers" ON careers;
DROP POLICY IF EXISTS "insert_own_careers" ON careers;
DROP POLICY IF EXISTS "update_own_careers" ON careers;
DROP POLICY IF EXISTS "delete_own_careers" ON careers;

CREATE POLICY "select_careers" ON careers FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_careers" ON careers FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_careers" ON careers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_careers" ON careers FOR DELETE
  TO anon, authenticated USING (true);

-- ---------- career_settings policies ----------
DROP POLICY IF EXISTS "select_own_career_settings" ON career_settings;
DROP POLICY IF EXISTS "insert_own_career_settings" ON career_settings;
DROP POLICY IF EXISTS "update_own_career_settings" ON career_settings;
DROP POLICY IF EXISTS "delete_own_career_settings" ON career_settings;

CREATE POLICY "select_career_settings" ON career_settings FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_career_settings" ON career_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_career_settings" ON career_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_career_settings" ON career_settings FOR DELETE
  TO anon, authenticated USING (true);