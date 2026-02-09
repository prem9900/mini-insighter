# BigQuery Setup Guide

This guide will walk you through setting up Google BigQuery for Mini-Insighter.

## Prerequisites

- A Google Cloud Platform (GCP) account
- A GCP project with billing enabled

## Step 1: Enable BigQuery API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Library**
4. Search for "BigQuery API"
5. Click **Enable**

## Step 2: Create a Service Account

1. Navigate to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Enter a name (e.g., "mini-insighter-bigquery")
4. Click **Create and Continue**
5. Grant the following roles:
   - **BigQuery Data Viewer**
   - **BigQuery Job User**
6. Click **Continue** then **Done**

## Step 3: Create and Download Service Account Key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON** format
5. Click **Create**
6. The JSON key file will download automatically
7. **Important:** Store this file securely - it contains credentials

## Step 4: Configure Environment Variables

1. Move the downloaded JSON key file to your project directory (e.g., `credentials/bigquery-key.json`)
2. Update your `.env.local` file:

```env
# BigQuery Configuration
GOOGLE_APPLICATION_CREDENTIALS=./credentials/bigquery-key.json
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
```

Replace `your-gcp-project-id` with your actual GCP project ID.

## Step 5: Prepare Your Dataset

1. Go to [BigQuery Console](https://console.cloud.google.com/bigquery)
2. Create a dataset (or use an existing one)
3. Upload or create a table with your data
4. Note down:
   - **Project ID** (e.g., `my-project-123`)
   - **Dataset ID** (e.g., `analytics_data`)
   - **Table ID** (e.g., `sales_data`)

## Step 6: Link Dataset in Mini-Insighter

1. Run the development server: `npm run dev`
2. Login to your account
3. Create a new project
4. You'll need to manually link the dataset via Supabase or create an API endpoint

### Manual Dataset Linking (via Supabase SQL Editor)

Run this SQL in your Supabase SQL Editor:

```sql
INSERT INTO datasets (project_id, bigquery_project_id, bigquery_dataset_id, bigquery_table_id)
VALUES (
  'your-project-uuid',  -- Get this from the projects table
  'my-project-123',     -- Your GCP project ID
  'analytics_data',     -- Your BigQuery dataset ID
  'sales_data'          -- Your BigQuery table ID
);
```

## Step 7: Test the Connection

1. Navigate to: `http://localhost:3000/api/bigquery/test`
2. You should see: `{"success":true,"message":"BigQuery connection successful"}`

If you see an error, check:
- The JSON key file path is correct
- The service account has the required permissions
- BigQuery API is enabled in your GCP project

## Example Dataset Structure

For best results, your BigQuery table should have:
- At least one numeric column (for aggregations)
- At least one categorical column (for grouping)
- Optionally, a date/timestamp column (for time-series analysis)

Example schema:
```
- date: DATE
- category: STRING
- sales: FLOAT64
- quantity: INTEGER
- region: STRING
```

## Security Best Practices

1. **Never commit** the service account JSON key to version control
2. Add `credentials/` to your `.gitignore`
3. Use environment variables for all sensitive data
4. Rotate service account keys periodically
5. Grant minimum required permissions

## Troubleshooting

### Error: "Could not load the default credentials"
- Check that `GOOGLE_APPLICATION_CREDENTIALS` path is correct
- Ensure the JSON key file exists and is readable

### Error: "Permission denied"
- Verify the service account has BigQuery Data Viewer and Job User roles
- Check that the dataset/table exists and is accessible

### Error: "Table not found"
- Verify the project ID, dataset ID, and table ID are correct
- Ensure they're in the format: `project.dataset.table`

## Next Steps

Once BigQuery is connected:
1. Create a project in Mini-Insighter
2. Link your dataset (manually for now)
3. Start asking questions in the chat interface!

Example questions to try:
- "What is the total sales?"
- "Show me sales by category"
- "What is the average quantity?"
- "Count the number of records"
