-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_chats_project_id ON chats(project_id);
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_created_at ON chats(created_at DESC);

-- Enable Row Level Security
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own chats
CREATE POLICY "Users can view their own chats"
  ON chats FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can create their own chats
CREATE POLICY "Users can create their own chats"
  ON chats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own chats
CREATE POLICY "Users can update their own chats"
  ON chats FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own chats
CREATE POLICY "Users can delete their own chats"
  ON chats FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
