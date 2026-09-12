-- ============================================
-- CHECK AND FIX NOTIFICATIONS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- First, check if the table exists
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications' 
  AND table_schema = 'public';

-- If the table doesn't exist or is wrong, drop and recreate it
DROP TABLE IF EXISTS notifications CASCADE;

-- Create notifications table with correct schema
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
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

-- Authenticated users can insert notifications (admin check in app)
CREATE POLICY "notifications_insert_authenticated"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON notifications TO authenticated;

-- Test the table
SELECT 'Notifications table created successfully! Columns:' as message;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'notifications' AND table_schema = 'public';
