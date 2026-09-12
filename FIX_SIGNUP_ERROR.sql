-- FIX FOR "Database error saving new user" during signup
-- Run these commands in Supabase SQL Editor in order

-- 1. Add username column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Add index for username (non-unique for now since existing users don't have it)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 3. Check if there's a trigger auto-creating profiles from auth.users
-- If a trigger exists and is causing issues, drop it:
-- (Uncomment the line below if you find a trigger named 'on_auth_user_created' or similar)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. Check if there's a function handling profile creation
-- If you have a function like handle_new_user(), you might need to update it
-- to handle the username field or drop it if you're handling profile creation in app code

-- After running this, also check your Supabase Authentication settings:
-- Go to: Authentication → Providers → Email
-- Make sure "Confirm email" is turned OFF during testing (you can turn it back on later)
