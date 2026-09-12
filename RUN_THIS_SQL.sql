-- ============================================
-- COMPLETE SQL TO RUN IN SUPABASE SQL EDITOR
-- This handles your existing database with usdt_balance
-- ============================================

-- 1. Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create enums (if they don't exist)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE referral_status AS ENUM ('pending', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_type AS ENUM ('ad', 'social');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_completion_status AS ENUM ('pending', 'verifying', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Add missing columns to profiles (your existing table)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_checkin_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 4. Make referral_code unique if not already
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_referral_code_key'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_referral_code_key UNIQUE (referral_code);
    END IF;
END $$;

-- 5. Create referrals table if it doesn't exist
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_amount DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
  status referral_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  UNIQUE(referred_id)
);

-- 6. Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type task_type NOT NULL,
  reward_amount DECIMAL(10, 2) NOT NULL,
  link TEXT NOT NULL,
  ad_network_slot TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns to tasks table if they don't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ad_network_slot TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 7. Create task_completions table if it doesn't exist
CREATE TABLE IF NOT EXISTS task_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status task_completion_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  reward_credited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

-- 8. Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_is_active ON tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_task_completions_user_id ON task_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_task_id ON task_completions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_status ON task_completions(status);

-- 9. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Add triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

-- 12. Drop existing policies (clean slate)
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

-- 13. Create RLS policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- 14. Create RLS policies for referrals
CREATE POLICY "Users can read own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can read referrals they are part of"
  ON referrals FOR SELECT
  USING (auth.uid() = referred_id);

CREATE POLICY "Service role can insert referrals"
  ON referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update referrals"
  ON referrals FOR UPDATE
  WITH CHECK (true);

CREATE POLICY "Admins can read all referrals"
  ON referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 15. Create RLS policies for tasks
CREATE POLICY "Anyone can read active tasks"
  ON tasks FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage tasks"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 16. Create RLS policies for task_completions
CREATE POLICY "Users can read own completions"
  ON task_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON task_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can update completions"
  ON task_completions FOR UPDATE
  WITH CHECK (true);

CREATE POLICY "Admins can read all completions"
  ON task_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 17. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON referrals TO anon, authenticated;
GRANT ALL ON tasks TO anon, authenticated;
GRANT ALL ON task_completions TO anon, authenticated;

-- 18. Insert sample tasks (only if none exist)
INSERT INTO tasks (title, type, reward_amount, link)
SELECT * FROM (VALUES
  ('Watch YouTube Video', 'ad'::task_type, 0.50, 'https://youtube.com/watch?v=example'),
  ('View Advertisement', 'ad'::task_type, 0.25, 'https://example.com/ad'),
  ('Follow us on Twitter', 'social'::task_type, 1.00, 'https://twitter.com/example'),
  ('Join Telegram Group', 'social'::task_type, 0.75, 'https://t.me/example'),
  ('Like Facebook Page', 'social'::task_type, 0.50, 'https://facebook.com/example'),
  ('Watch Product Demo', 'ad'::task_type, 0.75, 'https://example.com/demo')
) AS v(title, type, reward_amount, link)
WHERE NOT EXISTS (SELECT 1 FROM tasks LIMIT 1);

-- ============================================
-- DONE! Now check for auth triggers:
-- ============================================
-- Run this separately to see if there are any auth triggers:
-- SELECT * FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;
--
-- If you see a trigger that creates profiles automatically,
-- you may need to update or drop it since it might not know about the username field.
