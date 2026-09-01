/*
# Fix: careers.user_id foreign key constraint blocks career creation

1. Root cause
   - careers.user_id has a FK to users(id) with DEFAULT gen_random_uuid().
   - When the app (no auth, anon role) inserts a career without specifying
     user_id, the default generates a random UUID that does not exist in the
     users table.
   - Postgres rejects the insert: "violates foreign key constraint
     careers_user_id_fkey" — Key (user_id)=(<random uuid>) is not present in
     table "users".
   - This is why every "Nova Carreira" attempt fails with "Não foi possível
     criar a carreira."

2. Fix
   - Drop the foreign key constraint careers_user_id_fkey.
   - Make user_id nullable (it remains for future auth integration but is no
     longer mandatory for the single-tenant no-auth app).
   - Keep the DEFAULT gen_random_uuid() so the column always has a value.
   - Do NOT drop the column or change its type (data safety).

3. Security
   - No policy changes. RLS on careers is already open (anon, authenticated)
     via migration 0002. The FK was not a security boundary — it was a data
     integrity constraint that no longer fits the no-auth single-tenant model.

4. Idempotent
   - Uses IF EXISTS on the constraint drop.
   - Uses IF EXISTS checks in a DO block for nullability.
   - No destructive operations on user data.
*/

-- Drop the FK constraint that blocks inserts when no auth session exists.
ALTER TABLE careers DROP CONSTRAINT IF EXISTS careers_user_id_fkey;

-- Make user_id nullable so the app can insert careers without an auth user.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'careers'
      AND column_name = 'user_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE careers ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;
