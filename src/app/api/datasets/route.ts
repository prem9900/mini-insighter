// Dataset API - Link BigQuery tables to projects
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTableSchema } from '@/lib/bigquery/client';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            project_id,
            bigquery_project_id,
            bigquery_dataset_id,
            bigquery_table_id
        } = await request.json();

        // Validate input
        if (!project_id || !bigquery_project_id || !bigquery_dataset_id || !bigquery_table_id) {
            return NextResponse.json({
                error: 'All fields are required: project_id, bigquery_project_id, bigquery_dataset_id, bigquery_table_id'
            }, { status: 400 });
        }

        // Verify user owns the project
        const { data: project, error: projectError } = await supabaseAdmin
            .from('projects')
            .select('id')
            .eq('id', project_id)
            .eq('user_id', user.id)
            .single();

        if (projectError || !project) {
            return NextResponse.json({
                error: 'Project not found or access denied'
            }, { status: 403 });
        }

        // Get table schema from BigQuery
        let schema = null;
        try {
            schema = await getTableSchema(bigquery_project_id, bigquery_dataset_id, bigquery_table_id);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return NextResponse.json({
                error: `Failed to fetch table schema from BigQuery: ${errorMessage}`
            }, { status: 400 });
        }

        // Normalize IDs before saving
        const cleanProjectId = bigquery_project_id.trim();
        const cleanDatasetId = bigquery_dataset_id.includes('.') ? bigquery_dataset_id.split('.').pop()!.trim() : bigquery_dataset_id.trim();
        const cleanTableId = bigquery_table_id.includes('.') ? bigquery_table_id.split('.').pop()!.trim() : bigquery_table_id.trim();

        // Create dataset link
        const { data: dataset, error } = await supabaseAdmin
            .from('datasets')
            .insert([
                {
                    project_id,
                    bigquery_project_id: cleanProjectId,
                    bigquery_dataset_id: cleanDatasetId,
                    bigquery_table_id: cleanTableId,
                    schema_json: schema,
                },
            ])
            .select()
            .single();

        if (error) {
            // Check for unique constraint violation
            if (error.code === '23505') {
                return NextResponse.json({
                    error: 'This dataset is already linked to this project'
                }, { status: 409 });
            }
            console.error('Error creating dataset:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ dataset }, { status: 201 });
    } catch (error: unknown) {
        console.error('Dataset POST error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        // Authenticate user
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get project_id from query params
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('project_id');

        if (!projectId) {
            return NextResponse.json({
                error: 'project_id query parameter is required'
            }, { status: 400 });
        }

        // Verify user owns the project
        const { data: project, error: projectError } = await supabaseAdmin
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .eq('user_id', user.id)
            .single();

        if (projectError || !project) {
            return NextResponse.json({
                error: 'Project not found or access denied'
            }, { status: 403 });
        }

        // Get datasets for this project
        const { data: datasets, error } = await supabaseAdmin
            .from('datasets')
            .select('*')
            .eq('project_id', projectId);

        if (error) {
            console.error('Error fetching datasets:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ datasets: datasets || [] });
    } catch (error: unknown) {
        console.error('Dataset GET error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
