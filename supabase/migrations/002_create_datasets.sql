-- Create datasets table
CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  bigquery_project_id TEXT NOT NULL,
  bigquery_dataset_id TEXT NOT NULL,
  bigquery_table_id TEXT NOT NULL,
  schema_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, bigquery_project_id, bigquery_dataset_id, bigquery_table_id)
);

-- Create index on project_id for faster queries
CREATE INDEX idx_datasets_project_id ON datasets(project_id);

-- Enable Row Level Security
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view datasets for their projects
CREATE POLICY "Users can view datasets for their projects"
  ON datasets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = datasets.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create policy: Users can create datasets for their projects
CREATE POLICY "Users can create datasets for their projects"
  ON datasets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = datasets.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create policy: Users can delete datasets for their projects
CREATE POLICY "Users can delete datasets for their projects"
  ON datasets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = datasets.project_id
      AND projects.user_id = auth.uid()
    )
  );
