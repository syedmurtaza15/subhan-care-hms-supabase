-- ============================================================
-- Create the handle_new_user trigger function and attach it
-- to auth.users so that every new sign-up auto-creates a
-- matching row in public.profiles with the correct role.
-- ============================================================

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_role text;
  user_name text;
  user_email text;
BEGIN
  -- Extract values from raw_user_meta_data (set during sign-up)
  user_name  := COALESCE(NEW.raw_user_meta_data ->> 'name',  split_part(NEW.email, '@', 1));
  user_role  := COALESCE(NEW.raw_user_meta_data ->> 'role', 'DOCTOR');
  user_email := NEW.email;

  INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    user_name,
    user_email,
    user_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email     = EXCLUDED.email,
    role      = EXCLUDED.role,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- 2. Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Also backfill profiles for any existing Auth users who
--    don't already have a row (important if you already created
--    users manually before this trigger existed).
INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1)),
  u.email,
  COALESCE(u.raw_user_meta_data ->> 'role', 'DOCTOR'),
  NOW(),
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;