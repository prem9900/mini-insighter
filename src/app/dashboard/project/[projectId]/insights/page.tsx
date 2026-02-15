"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import LinkDatasetModal from '@/components/connections/LinkDatasetModal';
import BigQueryConnect from '@/components/connections/BigQueryConnect';
import ChatInterface from '@/components/chat/ChatInterface';

export default function InsightsPage({ params }: { params: { projectId: string } }) {
    const [datasetConnected, setDatasetConnected] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [disconnecting, setDisconnecting] = useState(false);
    const [showConnectionModal, setShowConnectionModal] = useState(false);
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);

    async function checkProjectConnection() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data } = await supabase
                .from('projects')
                .select('dataset_id')
                .eq('id', params.projectId)
                .single();

            if (data) {
                setDatasetConnected(!!data.dataset_id);
            }
        } catch {
            console.error('Error checking project connection');
        } finally {
            setLoading(false);
        }
    }

    async function performDisconnect() {
        setDisconnecting(true);
        try {
            const { error } = await supabase
                .from('projects')
                .update({ dataset_id: null })
                .eq('id', params.projectId);

            if (error) throw error;
            setDatasetConnected(false);
            setShowDisconnectModal(false);
        } catch (error) {
            console.error('Error disconnecting dataset:', error);
            alert('Failed to disconnect dataset');
        } finally {
            setDisconnecting(false);
        }
    }

    useEffect(() => {
        checkProjectConnection();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.projectId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
            </div>
        );
    }

    // If not connected, we show the connector.
    if (!datasetConnected) {
        return (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto p-6">
                <div className="w-full">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-heading font-bold text-zinc-900 mb-3">Connect Your Data</h1>
                        <p className="text-zinc-500 text-lg">
                            Link your BigQuery dataset to start generating insights.
                        </p>
                    </div>
                    <BigQueryConnect
                        projectId={params.projectId}
                        onConnected={() => setDatasetConnected(true)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col relative">
            {/* Premium Header for Connection Status */}
            <div className="absolute top-6 right-6 z-10 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md border border-zinc-200 shadow-sm px-4 py-2 rounded-full text-sm font-medium text-zinc-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></div>
                    BigQuery Connected
                </div>

                <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-zinc-200 shadow-sm p-1.5 rounded-full">
                    <button
                        onClick={() => setShowConnectionModal(true)}
                        className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all"
                        title="Edit Connection"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                    <div className="w-px h-4 bg-zinc-200"></div>
                    <button
                        onClick={() => setShowDisconnectModal(true)}
                        className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                        title="Disconnect Dataset"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>

            <ChatInterface projectId={params.projectId} />

            {showConnectionModal && (
                <LinkDatasetModal
                    projectId={params.projectId}
                    onClose={() => setShowConnectionModal(false)}
                    onSuccess={() => {
                        setShowConnectionModal(false);
                        setDatasetConnected(true);
                    }}
                />
            )}

            {showDisconnectModal && (
                <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-zinc-200 animate-in zoom-in-95 duration-200 overflow-hidden transform transition-all">
                        <div className="p-6">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <svg className="text-red-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </div>
                            <h3 className="text-xl font-heading font-bold text-zinc-900 mb-2 text-center">Disconnect Dataset?</h3>
                            <p className="text-zinc-500 mb-8 text-center text-sm leading-relaxed">
                                Are you sure you want to remove this dataset connection? <br />This action cannot be undone.
                            </p>

                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setShowDisconnectModal(false)}
                                    className="px-5 py-2.5 rounded-xl font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors border border-transparent hover:border-zinc-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={performDisconnect}
                                    disabled={disconnecting}
                                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 active:scale-95"
                                >
                                    {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
