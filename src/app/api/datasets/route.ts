import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTableSchema } from "@/lib/bigquery/client";

// Create Supabase client with service role for bypassing RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        // Verify user session to ensure security
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
        }

        const { projectId, tableName } = await request.json();

        // Parse tableName (project.dataset.table)
        const parts = tableName.split('.');
        if (parts.length < 3) {
            return NextResponse.json({ error: 'Invalid table name format. Expected project.dataset.table' }, { status: 400 });
        }

        const bqProjectId = parts[0];
        const bqDatasetId = parts[1];
        const bqTableId = parts[2];

        // 1. Get Metadata (Schema) using centralized client
        // This will throw if credentials are bad or table not found
        const schema = await getTableSchema(bqProjectId, bqDatasetId, bqTableId);

        // 3. Create Dataset in Supabase using ADMIN client to bypass RLS
        const { data: dataset, error: dsError } = await supabaseAdmin
            .from('datasets')
            .insert({
                project_id: projectId,
                bigquery_project_id: bqProjectId,
                bigquery_dataset_id: bqDatasetId,
                bigquery_table_id: bqTableId,
                schema_json: schema
            })
            .select()
            .single();

        if (dsError) {
            console.error('Supabase Insert Error:', dsError);
            throw new Error(`Failed to save dataset: ${dsError.message}`);
        }

        // 4. Update project to reflect connected status
        const { error: projError } = await supabaseAdmin
            .from('projects')
            .update({
                dataset_id: dataset.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId);

        if (projError) {
            console.error('Supabase Project Update Error:', projError);
            // Don't throw here, dataset is already created
        }

        return NextResponse.json({ success: true, dataset });

    } catch (error: unknown) {
        console.error('Dataset API Error:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = String((error as Record<string, unknown>).message);
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else {
            errorMessage = String(error);
        }

        return NextResponse.json({
            error: errorMessage,
            details: JSON.stringify(error, Object.getOwnPropertyNames(error))
        }, { status: 500 });
    }
}
