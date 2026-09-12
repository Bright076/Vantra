-- Add RLS policies for referrals page to allow reading referred user info

-- Allow users to update their own wallet address
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- The referrals policies should already exist from FIX_RLS_POLICIES.sql
-- But let's make sure they're correct:

-- Drop and recreate to be safe
DROP POLICY IF EXISTS "referrals_select_referrer" ON referrals;
DROP POLICY IF EXISTS "referrals_select_referred" ON referrals;

-- Users can read referrals where they are the referrer (for /referrals page)
CREATE POLICY "referrals_select_referrer"
  ON referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id);

-- Users can read referrals where they are referred (for checking their own status)
CREATE POLICY "referrals_select_referred"
  ON referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referred_id);

-- Note: The referrals page joins with profiles to get username/email
-- The profiles_select_leaderboard policy already allows reading username and email
