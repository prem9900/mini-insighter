"use client";


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Project } from '@/types/project';
import Link from 'next/link';
import Logo from '@/components/shared/Logo';
import { GEMINI_MODELS, DEFAULT_GEMINI_MODEL } from '@/lib/constants/gemini-models';

export default function DashboardPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [geminiModel, setGeminiModel] = useState(DEFAULT_GEMINI_MODEL);
    const [creating, setCreating] = useState(false);

    // Edit & Delete State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [updating, setUpdating] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

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
                    gemini_api_key: geminiApiKey,
                    gemini_model: geminiModel
                }),
            });

            if (response.ok) {
                setShowCreateModal(false);
                setNewProjectName('');
                setNewProjectDesc('');
                setGeminiApiKey('');
                loadProjects();
            }
        } catch (error) {
            console.error('Error creating project:', error);
        } finally {
            setCreating(false);
        }
    }

    async function handleUpdateProject() {
        if (!editingProject || !editingProject.name.trim()) return;

        setUpdating(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch(`/api/projects/${editingProject.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editingProject.name,
                    description: editingProject.description,
                    gemini_api_key: editingProject.gemini_api_key,
                    gemini_model: editingProject.gemini_model
                }),
            });

            if (response.ok) {
                setShowEditModal(false);
                setEditingProject(null);
                loadProjects();
            }
        } catch (error) {
            console.error('Error updating project:', error);
        } finally {
            setUpdating(false);
        }
    }

    async function handleDeleteProject() {
        if (!deletingProjectId) return;

        setDeleting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch(`/api/projects/${deletingProjectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (response.ok) {
                setShowDeleteModal(false);
                setDeletingProjectId(null);
                loadProjects();
            }
        } catch (error) {
            console.error('Error deleting project:', error);
        } finally {
            setDeleting(false);
        }
    }

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setShowEditModal(true);
    };

    const openDeleteModal = (projectId: string) => {
        setDeletingProjectId(projectId);
        setShowDeleteModal(true);
    };

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push('/login');
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                    <div className="text-sm font-bold text-secondary-500 tracking-widest uppercase">Initializing...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white bg-grid-pattern font-sans selection:bg-primary-600 selection:text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-primary-100 bg-white/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex justify-between items-center">
                    <Logo showText size={40} />
                    <button
                        onClick={handleLogout}
                        className="text-sm font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 transition-all px-5 py-2.5 rounded-xl border border-red-100 shadow-sm flex items-center gap-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Log out
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6">
                    <div>
                        <h2 className="text-4xl font-heading font-black tracking-tight text-secondary-900 mb-2">My Projects</h2>
                        <p className="text-secondary-500 text-lg font-medium max-w-lg leading-relaxed">Select a workspace to search for insights in your BigQuery data.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center gap-2 shadow-xl shadow-primary-900/20 px-8 py-3"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        New Project
                    </button>
                </div>

                {/* Projects Grid */}
                {projects.length === 0 ? (
                    <div className="bg-primary-50/30 backdrop-blur-sm border-2 border-dashed border-primary-200 rounded-3xl py-24 text-center hover:bg-primary-50/50 hover:border-primary-300 transition-all duration-300 group cursor-pointer" onClick={() => setShowCreateModal(true)}>
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary-500 border border-primary-100 shadow-xl shadow-primary-900/5 group-hover:scale-110 transition-transform">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-secondary-900 mb-2 font-heading">No projects found</h3>
                        <p className="text-secondary-500 mb-8 max-w-sm mx-auto font-medium">Create your first project to start analyzing your cloud data.</p>
                        <span className="btn-primary inline-flex">Get Started</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/dashboard/project/${project.id}`}
                                className="group relative overflow-hidden rounded-3xl bg-white border border-primary-100 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-900/10 hover:-translate-y-2 block h-[240px]"
                            >
                                <div className="absolute top-6 right-6 z-20 flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            openEditModal(project);
                                        }}
                                        className="p-2 bg-white hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 rounded-full border border-zinc-100 shadow-sm transition-colors"
                                        title="Edit Project"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            openDeleteModal(project.id);
                                        }}
                                        className="p-2 bg-white hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-full border border-zinc-100 shadow-sm transition-colors"
                                        title="Delete Project"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>

                                <div className="h-full flex flex-col justify-between relative z-10">
                                    <div>
                                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 text-xl font-black text-white shadow-lg shadow-zinc-900/20">
                                            {project.name.substring(0, 1).toUpperCase()}
                                        </div>
                                        <h3 className="text-2xl font-black text-secondary-900 tracking-tight mb-2 truncate pr-10">{project.name}</h3>
                                        <p className="text-sm text-secondary-500 line-clamp-2 leading-relaxed font-medium">
                                            {project.description || 'Manage analytics for this workspace.'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 shadow-sm">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Active Workspace</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-secondary-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-primary-50 bg-primary-50/30 relative">
                            <h3 className="text-2xl font-heading font-black text-secondary-900 tracking-tight">New Project</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="absolute top-8 right-8 text-secondary-400 hover:text-secondary-900 transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-secondary-500 uppercase tracking-widest ml-1">Project Name</label>
                                    <input
                                        type="text"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="input-field text-lg"
                                        placeholder="e.g. Sales Growth 2024"
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-secondary-500 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        value={newProjectDesc}
                                        onChange={(e) => setNewProjectDesc(e.target.value)}
                                        className="input-field min-h-[120px] py-4 text-base"
                                        placeholder="What kind of insights are you looking for?"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-secondary-500 uppercase tracking-widest ml-1">Gemini API Key</label>
                                    <input
                                        type="password"
                                        value={geminiApiKey}
                                        onChange={(e) => setGeminiApiKey(e.target.value)}
                                        className="input-field text-lg font-mono"
                                        placeholder="AIzaSy..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-secondary-500 uppercase tracking-widest ml-1">Model Selection</label>
                                    <select
                                        value={geminiModel}
                                        onChange={(e) => setGeminiModel(e.target.value)}
                                        className="input-field bg-white"
                                    >
                                        {GEMINI_MODELS.map(model => (
                                            <option key={model.id} value={model.id}>
                                                {model.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-start gap-3">
                                    <svg className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-[11px] text-secondary-600 leading-relaxed">
                                        Your API keys are stored securely and used only for your projects.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-primary-50/30 border-t border-primary-50 flex gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="btn-ghost flex-1">Discard</button>
                            <button
                                onClick={createProject}
                                className="btn-primary flex-1"
                                disabled={creating || !newProjectName.trim()}
                            >
                                {creating ? "Creating..." : "Launch Project"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Project Modal */}
            {showEditModal && editingProject && (
                <div className="fixed inset-0 bg-secondary-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <h2 className="text-2xl font-black text-secondary-900 mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                </span>
                                Edit Project
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-secondary-700 mb-2 ml-1">Project Name</label>
                                    <input
                                        type="text"
                                        value={editingProject.name}
                                        onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium text-secondary-900 placeholder-secondary-400"
                                        placeholder="e.g. Q4 Sales Analysis"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-secondary-700 mb-2 ml-1">Description</label>
                                    <textarea
                                        value={editingProject.description || ''}
                                        onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium text-secondary-900 placeholder-secondary-400 min-h-[100px] resize-none"
                                        placeholder="What kind of insights are you looking for?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-secondary-700 mb-2 ml-1">Model Selection</label>
                                    <div className="relative">
                                        <select
                                            value={editingProject.gemini_model || DEFAULT_GEMINI_MODEL}
                                            onChange={(e) => setEditingProject({ ...editingProject, gemini_model: e.target.value })}
                                            className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium text-secondary-900 appearance-none cursor-pointer"
                                        >
                                            {GEMINI_MODELS.map((model) => (
                                                <option key={model.id} value={model.id}>
                                                    {model.name} - {model.description}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-secondary-500">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-3 rounded-xl font-bold text-white bg-gray-600 hover:bg-gray-700 transition-colors shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateProject}
                                    disabled={updating || !editingProject.name}
                                    className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold shadow-lg shadow-gray-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {updating ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-secondary-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            </div>
                            <h3 className="text-2xl font-heading font-black text-secondary-900 tracking-tight">Delete Project?</h3>
                            <p className="text-secondary-500 font-medium">
                                Are you sure you want to delete this project? This action cannot be undone.
                            </p>
                        </div>

                        <div className="p-6 bg-primary-50/30 border-t border-primary-50 flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="btn-ghost flex-1">Cancel</button>
                            <button
                                onClick={handleDeleteProject}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-500/20 flex-1"
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
