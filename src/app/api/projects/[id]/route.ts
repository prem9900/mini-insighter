// Project API routes - Get, Update, Delete
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { DEFAULT_GEMINI_MODEL } from '@/lib/constants/gemini-models';

// Create Supabase client with service role for server-side operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to authenticate user
async function getUser(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) return null;
    return user;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: project, error } = await supabaseAdmin
            .from('projects')
            .select('*')
            .eq('id', params.id)
            .eq('user_id', user.id) // Ensure ownership
            .single();

        if (error) {
            console.error('Error fetching project:', error);
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({ project });
    } catch (error: unknown) {
        console.error('Project GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, description, gemini_api_key, gemini_model } = body;

        // Construct update object
        const updates: Record<string, string | null> = {};
        if (name !== undefined) updates.name = name.trim();
        if (description !== undefined) updates.description = description?.trim() || null;
        if (gemini_api_key !== undefined) updates.gemini_api_key = gemini_api_key?.trim() || null;
        if (gemini_model !== undefined) updates.gemini_model = gemini_model || DEFAULT_GEMINI_MODEL;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        const { data: project, error } = await supabaseAdmin
            .from('projects')
            .update(updates)
            .eq('id', params.id)
            .eq('user_id', user.id) // Ensure ownership
            .select()
            .single();

        if (error) {
            console.error('Error updating project:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ project });
    } catch (error: unknown) {
        console.error('Project PATCH error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { error } = await supabaseAdmin
            .from('projects')
            .delete()
            .eq('id', params.id)
            .eq('user_id', user.id); // Ensure ownership

        if (error) {
            console.error('Error deleting project:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Project DELETE error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
