"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Project } from '@/types/project';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function DashboardPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');
    const [creating, setCreating] = useState(false);

    const loadProjects = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch('/api/projects', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setProjects(data.projects || []);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        async function checkAuth() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            }
        }

        checkAuth();
        loadProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    async function createProject() {
        if (!newProjectName.trim()) return;

        setCreating(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newProjectName,
                    description: newProjectDesc,
                }),
            });

            if (response.ok) {
                setShowCreateModal(false);
                setNewProjectName('');
                setNewProjectDesc('');
                loadProjects();
            }
        } catch (error) {
            console.error('Error creating project:', error);
        } finally {
            setCreating(false);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push('/login');
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    <div className="text-sm font-medium text-zinc-500">Loading your workspace...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 bg-grid-pattern font-sans selection:bg-zinc-900 selection:text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Logo size={32} />
                        <div className="flex flex-col">
                            <span className="font-heading font-black tracking-tight text-lg sm:text-xl leading-none text-black">Mini Insighter</span>
                            <span className="text-[10px] sm:text-xs text-black font-bold tracking-wide">WORKSPACE</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm font-extrabold text-black hover:bg-zinc-100 transition-colors px-3 sm:px-4 py-2 rounded-full border border-transparent hover:border-black"
                    >
                        Log out
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-zinc-900 mb-2">Projects</h2>
                        <p className="text-zinc-500 text-base sm:text-lg font-light max-w-lg">Manage your analytics workspaces and generate insights from your data.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/20"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        New Project
                    </button>
                </div>

                {/* Projects Grid */}
                {projects.length === 0 ? (
                    <div className="bg-white/40 backdrop-blur-sm border border-dashed border-zinc-300 rounded-2xl py-12 sm:py-24 text-center hover:bg-white/60 hover:border-zinc-400 transition-all duration-300 group cursor-pointer" onClick={() => setShowCreateModal(true)}>
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 text-xl sm:text-2xl text-zinc-400 border border-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] group-hover:scale-110 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-2 font-heading">No projects yet</h3>
                        <p className="text-zinc-500 mb-6 sm:mb-8 max-w-sm mx-auto text-sm sm:text-base px-4">Get started by creating your first analytics project to connect BigQuery.</p>
                        <span className="text-sm font-semibold text-zinc-900 border-b border-zinc-900 pb-0.5 hover:opacity-70 transition-opacity">
                            Create First Project
                        </span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/dashboard/projects/${project.id}`}
                                className="group relative overflow-hidden rounded-2xl bg-white border border-zinc-200 p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-zinc-300 hover:-translate-y-1 block h-[220px]"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-900">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </div>
                                </div>

                                <div className="h-full flex flex-col justify-between relative z-10">
                                    <div>
                                        <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4 text-xl font-black text-black shadow-sm">
                                            {project.name.substring(0, 1).toUpperCase()}
                                        </div>
                                        <h3 className="text-xl font-black text-black tracking-tight mb-2 truncate pr-8">{project.name}</h3>
                                        <p className="text-sm text-zinc-700 line-clamp-2 leading-relaxed font-medium">
                                            {project.description || 'No description provided.'}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mt-4">
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                            {new Date(project.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                {/* Subtle gradient overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-zinc-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-[420px] p-0 overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 mx-auto">
                        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/30">
                            <div>
                                <h3 className="font-heading font-bold text-lg text-zinc-900">New Project</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Create a workspace for your data.</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-zinc-400 hover:text-zinc-900 transition-colors p-2 rounded-full hover:bg-zinc-100"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Project Name</label>
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    className="input-field bg-zinc-50/50 text-base sm:text-sm"
                                    placeholder="e.g. Q4 Revenue Analysis"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Description <span className="text-zinc-300 font-normal normal-case">(Optional)</span></label>
                                <textarea
                                    value={newProjectDesc}
                                    onChange={(e) => setNewProjectDesc(e.target.value)}
                                    className="input-field min-h-[100px] resize-none bg-zinc-50/50 py-3 text-base sm:text-sm"
                                    placeholder="Briefly describe the purpose of this workspace..."
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-50/50 border-t border-zinc-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="btn-ghost"
                                disabled={creating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createProject}
                                className="btn-primary"
                                disabled={creating || !newProjectName.trim()}
                            >
                                {creating ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Creating...</span>
                                    </div>
                                ) : 'Create Project'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
