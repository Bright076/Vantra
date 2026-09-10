-- Create task type enum
CREATE TYPE task_type AS ENUM ('ad', 'social');

-- Create task completion status enum
CREATE TYPE task_completion_status AS ENUM ('pending', 'verifying', 'completed', 'failed');

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type task_type NOT NULL,
  reward_amount DECIMAL(10, 2) NOT NULL,
  task_link TEXT NOT NULL,
  ad_network_slot TEXT, -- For future ad network integration
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create task_completions table
CREATE TABLE task_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status task_completion_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  reward_credited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, user_id) -- Prevent duplicate completions
);

-- Create indexes
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_is_active ON tasks(is_active);
CREATE INDEX idx_task_completions_user_id ON task_completions(user_id);
CREATE INDEX idx_task_completions_task_id ON task_completions(task_id);
CREATE INDEX idx_task_completions_status ON task_completions(status);

-- Add trigger for tasks updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
-- Anyone (authenticated) can read active tasks
CREATE POLICY "Anyone can read active tasks"
  ON tasks FOR SELECT
  USING (is_active = true);

-- Admins can do everything with tasks
CREATE POLICY "Admins can manage tasks"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for task_completions
-- Users can read their own completions
CREATE POLICY "Users can read own completions"
  ON task_completions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own completions
CREATE POLICY "Users can insert own completions"
  ON task_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can update completions (for status changes)
CREATE POLICY "Service role can update completions"
  ON task_completions FOR UPDATE
  WITH CHECK (true);

-- Admins can read all completions
CREATE POLICY "Admins can read all completions"
  ON task_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON tasks TO anon, authenticated;
GRANT ALL ON task_completions TO anon, authenticated;

-- Insert sample tasks for testing
INSERT INTO tasks (title, description, type, reward_amount, task_link) VALUES
('Watch YouTube Video', 'Watch our promotional video on YouTube', 'ad', 0.50, 'https://youtube.com/watch?v=example'),
('View Advertisement', 'View a 30-second advertisement', 'ad', 0.25, 'https://example.com/ad'),
('Follow us on Twitter', 'Follow our Twitter account and like our pinned post', 'social', 1.00, 'https://twitter.com/example'),
('Join Telegram Group', 'Join our Telegram community group', 'social', 0.75, 'https://t.me/example'),
('Like Facebook Page', 'Like and share our Facebook page', 'social', 0.50, 'https://facebook.com/example'),
('Watch Product Demo', 'Watch our 2-minute product demonstration', 'ad', 0.75, 'https://example.com/demo');

-- Add comment
COMMENT ON TABLE tasks IS 'Available tasks for users to complete';
COMMENT ON TABLE task_completions IS 'Tracks user task completion status';
COMMENT ON COLUMN tasks.ad_network_slot IS 'HTML/script for third-party ad network integration';
