-- This will drop any trigger on auth.users that might be causing the signup error
-- Run this in Supabase SQL Editor

-- First, see what triggers exist
SELECT 
  tgname as trigger_name,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'auth.users'::regclass;

-- Common trigger names that might exist:
-- Drop them (these will only drop if they exist, no error if they don't)

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile_for_user ON auth.users;
DROP TRIGGER IF EXISTS insert_profile ON auth.users;

-- Also check if there's a function we need to update or drop
-- If you see a function name from the SELECT above, you might need to drop it too:
-- DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
-- DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- After dropping triggers, the signup code will handle profile creation
