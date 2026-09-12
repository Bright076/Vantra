-- Test if we can manually insert into profiles table
-- This will help us see if RLS policies are blocking inserts

-- Temporarily disable RLS to test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Try the signup again after running this
-- If it works, then RLS policies were the issue

-- After testing, re-enable RLS:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
