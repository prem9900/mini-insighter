// Projects API routes - List and Create
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_GEMINI_MODEL } from '@/lib/constants/gemini-models';

// Create Supabase client with service role for server-side operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    try {
        // Get user from session
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user's projects
        const { data: projects, error } = await supabaseAdmin
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ projects });
    } catch (error: unknown) {
        console.error('Projects GET error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get user from session
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, description, gemini_api_key, gemini_model } = await request.json();

        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
        }

        // Create project
        const { data: project, error } = await supabaseAdmin
            .from('projects')
            .insert([
                {
                    user_id: user.id,
                    name: name.trim(),
                    description: description?.trim() || null,
                    gemini_api_key: gemini_api_key?.trim() || null,
                    gemini_model: gemini_model || DEFAULT_GEMINI_MODEL
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating project:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ project }, { status: 201 });
    } catch (error: unknown) {
        console.error('Projects POST error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
