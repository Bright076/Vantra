-- ============================================
-- FIX WITHDRAWAL SYSTEM (if tables already exist)
-- Run this in Supabase SQL Editor
-- ============================================

-- Check if withdrawal_status enum exists, create if not
DO $$ BEGIN
    CREATE TYPE withdrawal_status AS ENUM ('pending', 'paid', 'ineligible');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing columns if tables exist but are incomplete
ALTER TABLE withdrawal_rounds ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
ALTER TABLE withdrawal_rounds ADD COLUMN IF NOT EXISTS withdrawal_date TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days';
ALTER TABLE withdrawal_rounds ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE withdrawal_rounds ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE withdrawal_rounds ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE withdrawal_winners ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
ALTER TABLE withdrawal_winners ADD COLUMN IF NOT EXISTS round_id UUID;
ALTER TABLE withdrawal_winners ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE withdrawal_winners ADD COLUMN IF NOT EXISTS rank INTEGER;
ALTER TABLE withdrawal_winners ADD COLUMN IF NOT EXISTS balance_at_selection DECIMAL(10, 2);
ALTER TABLE withdrawal_winners ADD COLUMN IF NOT EXISTS status withdrawal_status DEFAULT 'pending';
ALTER TABLE withdrawal_winners ADD COLUMN IF NOT EXISTS ineligibility_reason TEXT;
ALTER TABLE withdrawal_winners ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE withdrawal_winners ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE withdrawal_winners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_withdrawal_rounds_active ON withdrawal_rounds(is_active);
CREATE INDEX IF NOT EXISTS idx_withdrawal_rounds_date ON withdrawal_rounds(withdrawal_date);
CREATE INDEX IF NOT EXISTS idx_withdrawal_winners_round_id ON withdrawal_winners(round_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_winners_user_id ON withdrawal_winners(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_winners_status ON withdrawal_winners(status);

-- Drop and recreate triggers
DROP TRIGGER IF EXISTS update_withdrawal_rounds_updated_at ON withdrawal_rounds;
CREATE TRIGGER update_withdrawal_rounds_updated_at
  BEFORE UPDATE ON withdrawal_rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_withdrawal_winners_updated_at ON withdrawal_winners;
CREATE TRIGGER update_withdrawal_winners_updated_at
  BEFORE UPDATE ON withdrawal_winners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE withdrawal_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_winners ENABLE ROW LEVEL SECURITY;

-- Drop old policies and recreate
DROP POLICY IF EXISTS "withdrawal_rounds_select_all" ON withdrawal_rounds;
DROP POLICY IF EXISTS "withdrawal_rounds_all_authenticated" ON withdrawal_rounds;
DROP POLICY IF EXISTS "withdrawal_winners_select_own" ON withdrawal_winners;
DROP POLICY IF EXISTS "withdrawal_winners_select_all" ON withdrawal_winners;
DROP POLICY IF EXISTS "withdrawal_winners_all_authenticated" ON withdrawal_winners;

-- RLS Policies for withdrawal_rounds
CREATE POLICY "withdrawal_rounds_select_all"
  ON withdrawal_rounds FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "withdrawal_rounds_all_authenticated"
  ON withdrawal_rounds FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for withdrawal_winners
CREATE POLICY "withdrawal_winners_select_own"
  ON withdrawal_winners FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "withdrawal_winners_select_all"
  ON withdrawal_winners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "withdrawal_winners_all_authenticated"
  ON withdrawal_winners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON withdrawal_rounds TO anon, authenticated;
GRANT ALL ON withdrawal_winners TO anon, authenticated;

-- Insert initial active round if none exists
INSERT INTO withdrawal_rounds (withdrawal_date, is_active)
SELECT NOW() + INTERVAL '30 days', true
WHERE NOT EXISTS (SELECT 1 FROM withdrawal_rounds WHERE is_active = true);

-- Done!
SELECT 'Withdrawal system fixed!' as message;
