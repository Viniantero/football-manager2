/*
# Football Manager — Module 01: Initial foundation

1. Purpose
   - Creates the minimal persistence layer for a single-player football
     management game. This module covers users, saved careers, and the
     basic configuration of a career only.
   - No gameplay tables (players, clubs, matches, transfers, finances,
     seasons) are created here. They will be added in later modules.

2. New tables
   - `users`
       - `id` (uuid, primary key). Mirrors auth.users.id for future auth.
       - `email` (text, unique). Convenience copy of the auth email.
       - `display_name` (text). In-game manager name shown in the UI.
       - `created_at` (timestamptz, default now()).
       - `updated_at` (timestamptz, default now()).
   - `careers`
       - `id` (uuid, primary key).
       - `user_id` (uuid, not null, defaults to auth.uid()). Owner.
       - `name` (text, not null). Human label for the save, e.g. "Save 01".
       - `manager_name` (text, not null). The in-game manager persona.
       - `status` (text, not null, default 'active'). active|archived.
       - `last_played_at` (timestamptz, default now()). Updated on load.
       - `created_at` (timestamptz, default now()).
       - `updated_at` (timestamptz, default now()).
   - `career_settings`
       - `id` (uuid, primary key).
       - `career_id` (uuid, not null, references careers, cascade delete).
       - `starting_balance` (integer, not null, default 5000000). In currency units.
       - `difficulty` (text, not null, default 'normal'). easy|normal|hard.
       - `currency_symbol` (text, not null, default 'R$').
       - `fixture_density` (text, not null, default 'balanced'). light|balanced|intense.
       - `transfer_window_frequency` (text, not null, default 'seasonal'). seasonal|monthly|open.
       - `injuries_enabled` (boolean, default true).
       - `youth_academy_enabled` (boolean, default true).
       - `created_at` (timestamptz, default now()).
       - `updated_at` (timestamptz, default now()).
       - UNIQUE (career_id) — one settings row per career.

3. Security
   - Enable RLS on users, careers, career_settings.
   - users: owner-scoped CRUD (auth.uid() = id).
   - careers: owner-scoped CRUD (auth.uid() = user_id). user_id defaults to auth.uid().
   - career_settings: owner-scoped CRUD scoped through the parent career.
   - All policies restricted to `authenticated` (the app has sign-in flow coming later).
     NOTE: Module 01 ships without a full auth UI; policies are written for the
     authenticated owner model so they are correct from day one.

4. Indexes
   - careers.user_id (frequent owner lookups).
   - career_settings.career_id (1:1 join).

5. Notes
   - Idempotent: uses IF NOT EXISTS and DROP POLICY IF EXISTS.
   - No destructive operations.
   - No gameplay data generated.
*/

-- ---------- profiles (named `users`) ----------
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_user" ON users;
CREATE POLICY "select_own_user" ON users FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_user" ON users;
CREATE POLICY "insert_own_user" ON users FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_user" ON users;
CREATE POLICY "update_own_user" ON users FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_user" ON users;
CREATE POLICY "delete_own_user" ON users FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ---------- careers ----------
CREATE TABLE IF NOT EXISTS careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  manager_name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  last_played_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE careers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_careers" ON careers;
CREATE POLICY "select_own_careers" ON careers FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_careers" ON careers;
CREATE POLICY "insert_own_careers" ON careers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_careers" ON careers;
CREATE POLICY "update_own_careers" ON careers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_careers" ON careers;
CREATE POLICY "delete_own_careers" ON careers FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- career_settings ----------
CREATE TABLE IF NOT EXISTS career_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  starting_balance integer NOT NULL DEFAULT 5000000,
  difficulty text NOT NULL DEFAULT 'normal',
  currency_symbol text NOT NULL DEFAULT 'R$',
  fixture_density text NOT NULL DEFAULT 'balanced',
  transfer_window_frequency text NOT NULL DEFAULT 'seasonal',
  injuries_enabled boolean NOT NULL DEFAULT true,
  youth_academy_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (career_id)
);

ALTER TABLE career_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_career_settings" ON career_settings;
CREATE POLICY "select_own_career_settings" ON career_settings FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM careers WHERE careers.id = career_settings.career_id AND careers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_career_settings" ON career_settings;
CREATE POLICY "insert_own_career_settings" ON career_settings FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM careers WHERE careers.id = career_settings.career_id AND careers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_career_settings" ON career_settings;
CREATE POLICY "update_own_career_settings" ON career_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM careers WHERE careers.id = career_settings.career_id AND careers.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM careers WHERE careers.id = career_settings.career_id AND careers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_career_settings" ON career_settings;
CREATE POLICY "delete_own_career_settings" ON career_settings FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM careers WHERE careers.id = career_settings.career_id AND careers.user_id = auth.uid())
  );

-- ---------- indexes ----------
CREATE INDEX IF NOT EXISTS idx_careers_user_id ON careers(user_id);
CREATE INDEX IF NOT EXISTS idx_career_settings_career_id ON career_settings(career_id);

-- ---------- updated_at triggers ----------
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_careers_updated_at ON careers;
CREATE TRIGGER trg_careers_updated_at BEFORE UPDATE ON careers
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_career_settings_updated_at ON career_settings;
CREATE TRIGGER trg_careers_settings_updated_at BEFORE UPDATE ON career_settings
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();