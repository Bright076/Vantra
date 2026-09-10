-- Add last_checkin_at column to profiles table
-- Run this if you already ran migration 001 and need to add the checkin feature

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_checkin_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN profiles.last_checkin_at IS 'Timestamp of user last daily check-in';
