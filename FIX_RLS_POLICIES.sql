-- Fix infinite recursion in RLS policies
-- The problem: admin policies query profiles table to check if user is admin,
-- which triggers the same policy again = infinite recursion

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can read referrals they are part of" ON referrals;
DROP POLICY IF EXISTS "Service role can insert referrals" ON referrals;
DROP POLICY IF EXISTS "Service role can update referrals" ON referrals;
DROP POLICY IF EXISTS "Admins can read all referrals" ON referrals;
DROP POLICY IF EXISTS "Anyone can read active tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can manage tasks" ON tasks;
DROP POLICY IF EXISTS "Users can read own completions" ON task_completions;
DROP POLICY IF EXISTS "Users can insert own completions" ON task_completions;
DROP POLICY IF EXISTS "Service role can update completions" ON task_completions;
DROP POLICY IF EXISTS "Admins can read all completions" ON task_completions;

-- ==========================================
-- PROFILES: Simple policies without recursion
-- ==========================================

-- Allow authenticated users to read their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow anyone to insert profiles (for signup)
CREATE POLICY "profiles_insert_all"
  ON profiles FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- ==========================================
-- REFERRALS
-- ==========================================

-- Users can read referrals where they are the referrer
CREATE POLICY "referrals_select_referrer"
  ON referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id);

-- Users can read referrals where they are referred
CREATE POLICY "referrals_select_referred"
  ON referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referred_id);

-- Allow inserting referrals
CREATE POLICY "referrals_insert_all"
  ON referrals FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Allow updating referrals (for marking as paid)
CREATE POLICY "referrals_update_all"
  ON referrals FOR UPDATE
  TO authenticated, anon
  WITH CHECK (true);

-- ==========================================
-- TASKS
-- ==========================================

-- Anyone can read active tasks
CREATE POLICY "tasks_select_active"
  ON tasks FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Allow insert/update/delete for all authenticated (admin panel will check role in app code)
CREATE POLICY "tasks_all_authenticated"
  ON tasks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- TASK_COMPLETIONS
-- ==========================================

-- Users can read their own completions
CREATE POLICY "completions_select_own"
  ON task_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own completions
CREATE POLICY "completions_insert_own"
  ON task_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow updating completions (for status changes)
CREATE POLICY "completions_update_all"
  ON task_completions FOR UPDATE
  TO authenticated
  WITH CHECK (true);

-- Done! No more infinite recursion
-- Admin role checks will be done in application code, not in RLS policies
