import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GeminiClient } from "@/lib/ai/gemini-client";
import { executeQuery } from "@/lib/bigquery/client";
import { formatResults } from "@/lib/formatter/result-formatter";

// Create Supabase client with service role for bypassing RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { projectId, query } = await request.json();

        // 1. Fetch Project & Dataset using Admin client
        const { data: project } = await supabaseAdmin
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (!project || !project.dataset_id) {
            return NextResponse.json({ error: 'Project or Dataset not found' }, { status: 404 });
        }

        const { data: dataset } = await supabaseAdmin
            .from('datasets')
            .select('*')
            .eq('id', project.dataset_id)
            .single();

        if (!dataset) {
            return NextResponse.json({ error: 'Dataset record not found' }, { status: 404 });
        }

        // Construct full table name for BigQuery
        // If dataset has new fields, use them. Fallback to table_id if others missing (for legacy)
        const fullTableName = dataset.bigquery_project_id && dataset.bigquery_dataset_id
            ? `${dataset.bigquery_project_id}.${dataset.bigquery_dataset_id}.${dataset.bigquery_table_id}`
            : dataset.bigquery_table_id;

        // 2. Initialize Gemini Client
        // Use project-specific key if available, otherwise rely on default env var
        const gemini = new GeminiClient(project.gemini_api_key, project.gemini_model);

        // 3. Generate SQL
        // We pass the FULL table name so the LLM writes valid SQL
        const { sql } = await gemini.generateSQL(query, fullTableName, dataset.schema_json?.fields || []);

        console.log(`Generated SQL: ${sql}`);

        // 4. Execute on BigQuery using centralized client (handles auth & env vars)
        const rows = await executeQuery(sql);

        // 5. Generate Summary
        const summary = await gemini.generateSummary(query, rows);

        // 6. Format and Return
        const formatted = formatResults(rows, sql);

        return NextResponse.json({
            success: true,
            answer: summary,
            sql: sql,
            data: formatted.data,
            visualization_type: formatted.visualization_type
        });

    } catch (error: unknown) {
        console.error('Query API Error:', error);

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
