// BigQuery execute query API route
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/bigquery/client';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
    try {
        const { sql, projectId } = await request.json();

        if (!sql) {
            return NextResponse.json({
                success: false,
                message: 'SQL query is required',
            }, { status: 400 });
        }

        // Get authenticated user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized',
            }, { status: 401 });
        }

        // If projectId is provided, verify user has access
        if (projectId) {
            const { data: project, error } = await supabase
                .from('projects')
                .select('id')
                .eq('id', projectId)
                .eq('user_id', session.user.id)
                .single();

            if (error || !project) {
                return NextResponse.json({
                    success: false,
                    message: 'Project not found or access denied',
                }, { status: 403 });
            }
        }

        // Execute query
        const startTime = Date.now();
        const results = await executeQuery(sql);
        const executionTime = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            data: results,
            metadata: {
                row_count: results.length,
                execution_time_ms: executionTime,
            },
        });
    } catch (error: unknown) {
        console.error('BigQuery execution error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Query execution failed';
        return NextResponse.json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        }, { status: 500 });
    }
}
