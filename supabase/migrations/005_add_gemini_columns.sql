-- Add missing columns to projects table for Gemini integration
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS gemini_api_key TEXT,
ADD COLUMN IF NOT EXISTS gemini_model TEXT DEFAULT 'gemini-1.5-flash',
ADD COLUMN IF NOT EXISTS dataset_id UUID REFERENCES datasets(id) ON DELETE SET NULL;

-- Create index on dataset_id for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_dataset_id ON projects(dataset_id);

-- Add comment explaining the columns
COMMENT ON COLUMN projects.gemini_api_key IS 'Gemini API key for this project (encrypted in production)';
COMMENT ON COLUMN projects.gemini_model IS 'Gemini model to use (e.g., gemini-1.5-flash, gemini-2.0-flash-exp)';
COMMENT ON COLUMN projects.dataset_id IS 'Reference to the linked BigQuery dataset';
