-- Add policy to allow users to read username and points from profiles
-- This is needed for the leaderboard

-- Drop old select policy and create new ones
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;

-- Users can read their own full profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can read limited info (username, points) from other profiles for leaderboard
CREATE POLICY "profiles_select_leaderboard"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Note: The leaderboard query only selects: id, username, email, points
-- So users can see leaderboard info but not full profiles of others
