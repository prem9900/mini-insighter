"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Logo from '@/components/shared/Logo';
import Link from 'next/link';

export default function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { projectId: string };
}) {
    const router = useRouter();
    const [projectName, setProjectName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProject() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push('/login');
                    return;
                }

                const { data } = await supabase
                    .from('projects')
                    .select('name')
                    .eq('id', params.projectId)
                    .single();

                if (data) {
                    setProjectName(data.name);
                }
            } catch (error) {
                console.error('Error loading project:', error);
            } finally {
                setLoading(false);
            }
        }

        loadProject();
    }, [params.projectId, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-primary-100 bg-white/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard">
                            <Logo showText size={40} />
                        </Link>
                        {projectName && (
                            <>
                                <div className="h-6 w-px bg-primary-200"></div>
                                <h2 className="text-lg font-bold text-secondary-900">{projectName}</h2>
                            </>
                        )}
                    </div>
                    <Link
                        href="/dashboard"
                        className="text-sm font-bold text-zinc-600 hover:text-white bg-zinc-50 hover:bg-zinc-900 transition-all px-5 py-2.5 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-2"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
