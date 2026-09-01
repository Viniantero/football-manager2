/*
# Football Manager — Module 02A: Clubs and Players

1. Purpose
   - Creates the `clubs` and `players` tables that form the foundation for
     future squad, match, training, transfer, and finance modules.
   - Adds referential integrity (players.club_id → clubs.id) and indexes for
     the most common query patterns.
   - Seeds 3 test clubs and 15 test players (5 per club) with fictitious names
     so the structure can be validated. All seed rows are clearly identifiable
     by the `is_test_data = true` flag so they can be removed/replaced later.

2. New tables
   - `clubs`
       - `id` (uuid, primary key, default gen_random_uuid())
       - `name` (text, not null) — full club name
       - `short_name` (text, not null) — abbreviated name (3-4 chars)
       - `city` (text, not null)
       - `state` (text, not null)
       - `stadium` (text, not null)
       - `stadium_capacity` (integer, not null, default 0)
       - `reputation` (integer, not null, default 50) — 1..100
       - `overall_strength` (integer, not null, default 50) — 1..100
       - `budget` (bigint, not null, default 0)
       - `payroll` (bigint, not null, default 0) — total salary expenditure
       - `youth_level` (integer, not null, default 3) — 1..5
       - `is_test_data` (boolean, not null, default false)
       - `created_at` (timestamptz, default now())
       - `updated_at` (timestamptz, default now())
   - `players`
       - `id` (uuid, primary key, default gen_random_uuid())
       - `club_id` (uuid, not null, references clubs(id) ON DELETE CASCADE)
       - `name` (text, not null)
       - `age` (integer, not null) — 15..45
       - `position` (text, not null) — one of GOL|ZAG|LAT|VOL|MC|MEI|PE|PD|ATA
       - `preferred_foot` (text, not null, default 'right') — left|right|both
       - `overall` (integer, not null, default 50) — 1..100 (derived; placeholder)
       - `potential` (integer, not null, default 50) — 1..100
       - `speed` (integer, not null, default 50) — 1..100
       - `finishing` (integer, not null, default 50) — 1..100
       - `passing` (integer, not null, default 50) — 1..100
       - `dribbling` (integer, not null, default 50) — 1..100
       - `defense` (integer, not null, default 50) — 1..100
       - `physical` (integer, not null, default 50) — 1..100
       - `goalkeeping` (integer, not null, default 50) — 1..100
       - `form` (integer, not null, default 70) — 0..100
       - `morale` (integer, not null, default 70) — 0..100
       - `fatigue` (integer, not null, default 0) — 0..100
       - `market_value` (bigint, not null, default 0)
       - `salary` (bigint, not null, default 0)
       - `contract_years` (integer, not null, default 1) — 0..10
       - `starter_status` (text, not null, default 'bench') — starter|bench|prospect
       - `is_test_data` (boolean, not null, default false)
       - `created_at` (timestamptz, default now())
       - `updated_at` (timestamptz, default now())

3. Constraints
   - CHECK on `clubs.reputation`, `clubs.overall_strength` (1..100)
   - CHECK on `clubs.youth_level` (1..5)
   - CHECK on `players.age` (15..45)
   - CHECK on `players.position` in allowed set
   - CHECK on `players.preferred_foot` in (left, right, both)
   - CHECK on skill attributes (overall, potential, speed, finishing, passing,
     dribbling, defense, physical, goalkeeping) — 1..100
   - CHECK on `players.form`, `players.morale`, `players.fatigue` — 0..100
   - CHECK on `players.contract_years` — 0..10
   - CHECK on `players.starter_status` in (starter, bench, prospect)

4. Indexes
   - `idx_players_club_id` on players(club_id)
   - `idx_players_position` on players(position)
   - `idx_players_overall` on players(overall)
   - `idx_players_potential` on players(potential)

5. Security
   - Enable RLS on both tables.
   - Single-tenant policies (TO anon, authenticated) consistent with Module 01.
   - `is_test_data` flag is informational, not a security boundary.

6. Seed data
   - 3 fictitious test clubs + 15 fictitious test players (5 per club).
   - All seed rows have `is_test_data = true` for easy removal later.
   - No real players or clubs are used.

7. Idempotent
   - Uses IF NOT EXISTS and DROP POLICY IF EXISTS.
   - No destructive table/column operations on existing tables.
*/

-- =========================================================================
-- clubs
-- =========================================================================
CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  stadium text NOT NULL,
  stadium_capacity integer NOT NULL DEFAULT 0,
  reputation integer NOT NULL DEFAULT 50,
  overall_strength integer NOT NULL DEFAULT 50,
  budget bigint NOT NULL DEFAULT 0,
  payroll bigint NOT NULL DEFAULT 0,
  youth_level integer NOT NULL DEFAULT 3,
  is_test_data boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_clubs_reputation CHECK (reputation >= 1 AND reputation <= 100),
  CONSTRAINT chk_clubs_overall_strength CHECK (overall_strength >= 1 AND overall_strength <= 100),
  CONSTRAINT chk_clubs_youth_level CHECK (youth_level >= 1 AND youth_level <= 5)
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_clubs" ON clubs;
CREATE POLICY "select_clubs" ON clubs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_clubs" ON clubs;
CREATE POLICY "insert_clubs" ON clubs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_clubs" ON clubs;
CREATE POLICY "update_clubs" ON clubs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_clubs" ON clubs;
CREATE POLICY "delete_clubs" ON clubs FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================================================
-- players
-- =========================================================================
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer NOT NULL,
  position text NOT NULL,
  preferred_foot text NOT NULL DEFAULT 'right',
  overall integer NOT NULL DEFAULT 50,
  potential integer NOT NULL DEFAULT 50,
  speed integer NOT NULL DEFAULT 50,
  finishing integer NOT NULL DEFAULT 50,
  passing integer NOT NULL DEFAULT 50,
  dribbling integer NOT NULL DEFAULT 50,
  defense integer NOT NULL DEFAULT 50,
  physical integer NOT NULL DEFAULT 50,
  goalkeeping integer NOT NULL DEFAULT 50,
  form integer NOT NULL DEFAULT 70,
  morale integer NOT NULL DEFAULT 70,
  fatigue integer NOT NULL DEFAULT 0,
  market_value bigint NOT NULL DEFAULT 0,
  salary bigint NOT NULL DEFAULT 0,
  contract_years integer NOT NULL DEFAULT 1,
  starter_status text NOT NULL DEFAULT 'bench',
  is_test_data boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_players_age CHECK (age >= 15 AND age <= 45),
  CONSTRAINT chk_players_position CHECK (position IN ('GOL','ZAG','LAT','VOL','MC','MEI','PE','PD','ATA')),
  CONSTRAINT chk_players_foot CHECK (preferred_foot IN ('left','right','both')),
  CONSTRAINT chk_players_overall CHECK (overall >= 1 AND overall <= 100),
  CONSTRAINT chk_players_potential CHECK (potential >= 1 AND potential <= 100),
  CONSTRAINT chk_players_speed CHECK (speed >= 1 AND speed <= 100),
  CONSTRAINT chk_players_finishing CHECK (finishing >= 1 AND finishing <= 100),
  CONSTRAINT chk_players_passing CHECK (passing >= 1 AND passing <= 100),
  CONSTRAINT chk_players_dribbling CHECK (dribbling >= 1 AND dribbling <= 100),
  CONSTRAINT chk_players_defense CHECK (defense >= 1 AND defense <= 100),
  CONSTRAINT chk_players_physical CHECK (physical >= 1 AND physical <= 100),
  CONSTRAINT chk_players_goalkeeping CHECK (goalkeeping >= 1 AND goalkeeping <= 100),
  CONSTRAINT chk_players_form CHECK (form >= 0 AND form <= 100),
  CONSTRAINT chk_players_morale CHECK (morale >= 0 AND morale <= 100),
  CONSTRAINT chk_players_fatigue CHECK (fatigue >= 0 AND fatigue <= 100),
  CONSTRAINT chk_players_contract_years CHECK (contract_years >= 0 AND contract_years <= 10),
  CONSTRAINT chk_players_starter_status CHECK (starter_status IN ('starter','bench','prospect'))
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_players" ON players;
CREATE POLICY "select_players" ON players FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_players" ON players;
CREATE POLICY "insert_players" ON players FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_players" ON players;
CREATE POLICY "update_players" ON players FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_players" ON players;
CREATE POLICY "delete_players" ON players FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================================================
-- indexes
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_players_club_id ON players(club_id);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_players_overall ON players(overall);
CREATE INDEX IF NOT EXISTS idx_players_potential ON players(potential);

-- =========================================================================
-- updated_at triggers (reuse existing fn_set_updated_at)
-- =========================================================================
DROP TRIGGER IF EXISTS trg_clubs_updated_at ON clubs;
CREATE TRIGGER trg_clubs_updated_at BEFORE UPDATE ON clubs
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_players_updated_at ON players;
CREATE TRIGGER trg_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- =========================================================================
-- seed data — 3 test clubs
-- =========================================================================
INSERT INTO clubs (id, name, short_name, city, state, stadium, stadium_capacity, reputation, overall_strength, budget, payroll, youth_level, is_test_data)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'Atlético Vulcão', 'VUL', 'Lava City', 'SP', 'Estádio do Vulcão', 45000, 78, 75, 12000000, 4000000, 4, true),
  ('11111111-1111-1111-1111-111111111102', 'Rio Branco FC', 'RBR', 'Porto Verde', 'MG', 'Arena Porto Verde', 32000, 65, 63, 6000000, 2200000, 3, true),
  ('11111111-1111-1111-1111-111111111103', 'Costa Azul EC', 'CAZ', 'Beira Mar', 'RS', 'Estádio Beira-Mar', 28000, 58, 56, 3500000, 1500000, 2, true)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- seed data — 15 test players (5 per club)
-- =========================================================================
INSERT INTO players (id, club_id, name, age, position, preferred_foot, overall, potential, speed, finishing, passing, dribbling, defense, physical, goalkeeping, form, morale, fatigue, market_value, salary, contract_years, starter_status, is_test_data)
VALUES
  -- Atlético Vulcão (5 players)
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'Teste Vulcão Goleiro', 28, 'GOL', 'right', 72, 78, 45, 20, 55, 30, 40, 70, 78, 75, 80, 0, 2500000, 120000, 3, 'starter', true),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 'Teste Vulcão Zagueiro', 26, 'ZAG', 'right', 74, 82, 65, 35, 60, 50, 80, 78, 30, 72, 75, 5, 3200000, 150000, 4, 'starter', true),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111101', 'Teste Vulcão Meia', 24, 'MEI', 'left', 76, 85, 70, 65, 80, 75, 55, 68, 25, 78, 82, 10, 5500000, 200000, 5, 'starter', true),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111101', 'Teste Vulcão Atacante', 23, 'ATA', 'right', 78, 88, 82, 80, 65, 78, 35, 72, 20, 80, 78, 15, 8000000, 280000, 5, 'starter', true),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111101', 'Teste Vulcão Lateral', 21, 'LAT', 'both', 65, 75, 75, 40, 60, 60, 62, 65, 25, 70, 72, 0, 1800000, 90000, 2, 'bench', true),

  -- Rio Branco FC (5 players)
  ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111102', 'Teste RBR Goleiro', 31, 'GOL', 'right', 68, 70, 40, 18, 50, 28, 38, 65, 72, 70, 75, 0, 1800000, 100000, 2, 'starter', true),
  ('22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111102', 'Teste RBR Volante', 27, 'VOL', 'right', 70, 74, 60, 40, 68, 55, 75, 72, 25, 72, 78, 8, 2200000, 120000, 3, 'starter', true),
  ('22222222-2222-2222-2222-222222222208', '11111111-1111-1111-1111-111111111102', 'Teste RBR Ponta', 22, 'PE', 'left', 71, 80, 78, 60, 62, 76, 40, 60, 20, 75, 70, 20, 3000000, 140000, 4, 'starter', true),
  ('22222222-2222-2222-2222-222222222209', '11111111-1111-1111-1111-111111111102', 'Teste RBR Zagueiro', 29, 'ZAG', 'right', 66, 68, 55, 30, 55, 45, 72, 70, 28, 68, 72, 0, 1500000, 85000, 2, 'bench', true),
  ('22222222-2222-2222-2222-222222222210', '11111111-1111-1111-1111-111111111102', 'Teste RBR Meia', 19, 'MC', 'right', 62, 82, 65, 50, 65, 60, 55, 58, 22, 65, 68, 0, 1200000, 70000, 1, 'prospect', true),

  -- Costa Azul EC (5 players)
  ('22222222-2222-2222-2222-222222222211', '11111111-1111-1111-1111-111111111103', 'Teste CAZ Goleiro', 25, 'GOL', 'right', 64, 72, 42, 15, 48, 25, 35, 62, 68, 70, 72, 0, 1200000, 70000, 3, 'starter', true),
  ('22222222-2222-2222-2222-222222222212', '11111111-1111-1111-1111-111111111103', 'Teste CAZ Lateral', 24, 'LAT', 'left', 63, 70, 72, 35, 55, 55, 58, 60, 22, 68, 70, 5, 1000000, 65000, 2, 'starter', true),
  ('22222222-2222-2222-2222-222222222213', '11111111-1111-1111-1111-111111111103', 'Teste CAZ Meia', 20, 'MEI', 'right', 60, 78, 62, 48, 60, 55, 50, 55, 20, 65, 65, 0, 900000, 55000, 1, 'prospect', true),
  ('22222222-2222-2222-2222-222222222214', '11111111-1111-1111-1111-111111111103', 'Teste CAZ Atacante', 26, 'ATA', 'right', 67, 70, 70, 68, 55, 65, 32, 65, 18, 70, 68, 12, 2000000, 95000, 3, 'starter', true),
  ('22222222-2222-2222-2222-222222222215', '11111111-1111-1111-1111-111111111103', 'Teste CAZ Volante', 23, 'VOL', 'both', 61, 68, 58, 35, 58, 48, 68, 62, 25, 65, 65, 0, 850000, 50000, 2, 'bench', true)
ON CONFLICT (id) DO NOTHING;