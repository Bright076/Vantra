-- Create withdrawal status enum
CREATE TYPE withdrawal_status AS ENUM ('pending', 'paid', 'ineligible');

-- Create withdrawal_rounds table
CREATE TABLE withdrawal_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  withdrawal_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create withdrawal_winners table
CREATE TABLE withdrawal_winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES withdrawal_rounds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  balance_at_selection DECIMAL(10, 2) NOT NULL,
  status withdrawal_status NOT NULL DEFAULT 'pending',
  ineligibility_reason TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(round_id, user_id)
);

-- Create indexes
CREATE INDEX idx_withdrawal_rounds_active ON withdrawal_rounds(is_active);
CREATE INDEX idx_withdrawal_rounds_date ON withdrawal_rounds(withdrawal_date);
CREATE INDEX idx_withdrawal_winners_round_id ON withdrawal_winners(round_id);
CREATE INDEX idx_withdrawal_winners_user_id ON withdrawal_winners(user_id);
CREATE INDEX idx_withdrawal_winners_status ON withdrawal_winners(status);

-- Add trigger for withdrawal_rounds updated_at
CREATE TRIGGER update_withdrawal_rounds_updated_at
  BEFORE UPDATE ON withdrawal_rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for withdrawal_winners updated_at
CREATE TRIGGER update_withdrawal_winners_updated_at
  BEFORE UPDATE ON withdrawal_winners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE withdrawal_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_winners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for withdrawal_rounds
-- Anyone can read active rounds
CREATE POLICY "withdrawal_rounds_select_all"
  ON withdrawal_rounds FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only authenticated users can manage rounds (admin check in app)
CREATE POLICY "withdrawal_rounds_all_authenticated"
  ON withdrawal_rounds FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for withdrawal_winners
-- Users can read their own winner entries
CREATE POLICY "withdrawal_winners_select_own"
  ON withdrawal_winners FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can read all winners (for leaderboard transparency)
CREATE POLICY "withdrawal_winners_select_all"
  ON withdrawal_winners FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can manage winners (admin check in app)
CREATE POLICY "withdrawal_winners_all_authenticated"
  ON withdrawal_winners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON withdrawal_rounds TO anon, authenticated;
GRANT ALL ON withdrawal_winners TO anon, authenticated;

-- Insert initial active round (30 days from now)
INSERT INTO withdrawal_rounds (withdrawal_date, is_active)
VALUES (NOW() + INTERVAL '30 days', true);

-- Add comments
COMMENT ON TABLE withdrawal_rounds IS 'Withdrawal rounds with dates';
COMMENT ON TABLE withdrawal_winners IS 'Top 5 winners selected each round';
COMMENT ON COLUMN withdrawal_winners.ineligibility_reason IS 'Reason if status is ineligible (e.g., balance under $100)';
