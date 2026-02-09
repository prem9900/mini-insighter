// Insights query API - Main pipeline for natural language to SQL to results
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildQuery } from '@/lib/rule-engine/query-builder';
import { executeQuery } from '@/lib/bigquery/client';
import { formatResults } from '@/lib/formatter/result-formatter';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate user
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get request data
        const { question, projectId, chatId } = await request.json();

        if (!question || !projectId) {
            return NextResponse.json({
                error: 'Question and projectId are required'
            }, { status: 400 });
        }

        // 3. Verify project access
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

        // 4. Get dataset for project
        const { data: dataset, error: datasetError } = await supabaseAdmin
            .from('datasets')
            .select('*')
            .eq('project_id', projectId)
            .single();

        if (datasetError || !dataset) {
            return NextResponse.json({
                error: 'No dataset linked to this project. Please link a BigQuery dataset first.'
            }, { status: 404 });
        }

        // 5. Build SQL query from question
        // Normalize IDs as a safeguard for existing malformed data in DB
        const cleanBQProjectId = dataset.bigquery_project_id.trim();
        const cleanBQDatasetId = dataset.bigquery_dataset_id.includes('.') ? dataset.bigquery_dataset_id.split('.').pop()!.trim() : dataset.bigquery_dataset_id.trim();
        const cleanBQTableId = dataset.bigquery_table_id.includes('.') ? dataset.bigquery_table_id.split('.').pop()!.trim() : dataset.bigquery_table_id.trim();

        const tableName = `${cleanBQProjectId}.${cleanBQDatasetId}.${cleanBQTableId}`;
        const schema = dataset.schema_json?.fields || [];

        const { sql, intent } = buildQuery(question, tableName, schema);

        // 6. Handle greetings early
        if (intent.type === 'greeting') {
            const userName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there';
            return NextResponse.json({
                success: true,
                result: {
                    sql: '',
                    data: [],
                    visualization_type: 'none',
                    metadata: {
                        row_count: 0,
                        message: `Hi ${userName}! I'm your data assistant. I can help you analyze your BigQuery data. Ask me anything about your spreadsheets or databases!`,
                    }
                },
                intent,
            });
        }

        // 7. Execute query in BigQuery
        const startTime = Date.now();
        const rawResults = await executeQuery(sql);
        const executionTime = Date.now() - startTime;

        // 7. Format results
        const result = formatResults(rawResults, sql);
        result.metadata!.execution_time_ms = executionTime;

        // 8. Save message to database if chatId provided
        if (chatId) {
            // Save user message
            await supabaseAdmin.from('messages').insert({
                chat_id: chatId,
                role: 'user',
                content: question,
            });

            // Save assistant message
            await supabaseAdmin.from('messages').insert({
                chat_id: chatId,
                role: 'assistant',
                content: `Found ${result.data.length} results`,
                sql_query: sql,
                query_results: result.data,
                visualization_type: result.visualization_type,
            });
        }

        // 9. Return response
        return NextResponse.json({
            success: true,
            result,
            intent,
        });

    } catch (error: unknown) {
        console.error('Insights query error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Query execution failed';
        return NextResponse.json({
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        }, { status: 500 });
    }
}
