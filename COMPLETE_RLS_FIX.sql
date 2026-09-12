-- ============================================
-- COMPLETE RLS POLICIES FIX
-- This ensures all policies work for both users and admins
-- Run this in Supabase SQL Editor
-- ============================================

-- ==========================================
-- PROFILES POLICIES
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_leaderboard" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_all" ON profiles;

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can read public profile info for leaderboard/referrals
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Anyone can insert profiles (signup)
CREATE POLICY "profiles_insert_all"
  ON profiles FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- ==========================================
-- REFERRALS POLICIES
-- ==========================================
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referrals_select_referrer" ON referrals;
DROP POLICY IF EXISTS "referrals_select_referred" ON referrals;
DROP POLICY IF EXISTS "referrals_insert_all" ON referrals;
DROP POLICY IF EXISTS "referrals_update_all" ON referrals;

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
-- TASKS POLICIES
-- ==========================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_select_active" ON tasks;
DROP POLICY IF EXISTS "tasks_all_authenticated" ON tasks;

-- Anyone can read active tasks
CREATE POLICY "tasks_select_active"
  ON tasks FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Authenticated users can manage tasks (admin in app)
CREATE POLICY "tasks_all_authenticated"
  ON tasks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- TASK_COMPLETIONS POLICIES
-- ==========================================
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "completions_select_own" ON task_completions;
DROP POLICY IF EXISTS "completions_insert_own" ON task_completions;
DROP POLICY IF EXISTS "completions_update_all" ON task_completions;
DROP POLICY IF EXISTS "completions_select_all" ON task_completions;

-- Users can read their own completions
CREATE POLICY "completions_select_own"
  ON task_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all completions
CREATE POLICY "completions_select_all"
  ON task_completions FOR SELECT
  TO authenticated
  USING (true);

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

-- ==========================================
-- WITHDRAWAL_ROUNDS POLICIES
-- ==========================================
ALTER TABLE withdrawal_rounds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "withdrawal_rounds_select_all" ON withdrawal_rounds;
DROP POLICY IF EXISTS "withdrawal_rounds_all_authenticated" ON withdrawal_rounds;

-- Anyone can read rounds
CREATE POLICY "withdrawal_rounds_select_all"
  ON withdrawal_rounds FOR SELECT
  TO authenticated, anon
  USING (true);

-- Authenticated users can manage rounds (admin in app)
CREATE POLICY "withdrawal_rounds_all_authenticated"
  ON withdrawal_rounds FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- WITHDRAWAL_WINNERS POLICIES
-- ==========================================
ALTER TABLE withdrawal_winners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "withdrawal_winners_select_own" ON withdrawal_winners;
DROP POLICY IF EXISTS "withdrawal_winners_select_all" ON withdrawal_winners;
DROP POLICY IF EXISTS "withdrawal_winners_all_authenticated" ON withdrawal_winners;

-- Users can read their own winner entries
CREATE POLICY "withdrawal_winners_select_own"
  ON withdrawal_winners FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- All users can read winners (transparency)
CREATE POLICY "withdrawal_winners_select_all"
  ON withdrawal_winners FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can manage winners (admin in app)
CREATE POLICY "withdrawal_winners_all_authenticated"
  ON withdrawal_winners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- NOTIFICATIONS POLICIES
-- ==========================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_authenticated" ON notifications;

-- Users can read their own notifications
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can insert notifications (admin in app)
CREATE POLICY "notifications_insert_authenticated"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ==========================================
-- GRANT PERMISSIONS
-- ==========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON referrals TO anon, authenticated;
GRANT ALL ON tasks TO anon, authenticated;
GRANT ALL ON task_completions TO anon, authenticated;
GRANT ALL ON withdrawal_rounds TO anon, authenticated;
GRANT ALL ON withdrawal_winners TO anon, authenticated;
GRANT ALL ON notifications TO authenticated;

-- Done!
SELECT 'All RLS policies fixed!' as message;
