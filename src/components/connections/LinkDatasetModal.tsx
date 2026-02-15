"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface LinkDatasetModalProps {
    projectId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function LinkDatasetModal({ projectId, onClose, onSuccess }: LinkDatasetModalProps) {
    const [bqProjectId, setBqProjectId] = useState('');
    const [bqDatasetId, setBqDatasetId] = useState('');
    const [bqTableId, setBqTableId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleConnect() {
        if (!bqProjectId.trim() || !bqDatasetId.trim() || !bqTableId.trim()) return;

        const fullTableName = `${bqProjectId.trim()}.${bqDatasetId.trim()}.${bqTableId.trim()}`;

        setLoading(true);
        setError('');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            // 1. Fetch schema from BigQuery (via API)
            // 2. Save dataset to Supabase
            // 3. Update project with dataset_id

            const response = await fetch('/api/datasets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    projectId,
                    tableName: fullTableName
                })
            });

            if (!response.ok) {
                const data = await response.json();
                const msg = data.error || 'Failed to connect dataset';
                const details = data.details ? ` (${data.details})` : '';
                throw new Error(msg + details);
            }

            onSuccess();
        } catch (err) {
            console.error('Connection error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-secondary-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-primary-100 animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-primary-50 bg-primary-50/30">
                    <h3 className="text-xl font-heading font-bold text-secondary-900">Connect BigQuery Table</h3>
                    <p className="text-sm text-secondary-500">Enter the details of the specific table you want to query.</p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-secondary-500 uppercase tracking-widest">GCP Project ID</label>
                            <input
                                type="text"
                                placeholder="my-data-project"
                                className="input-field font-mono text-sm"
                                value={bqProjectId}
                                onChange={(e) => setBqProjectId(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-secondary-500 uppercase tracking-widest">Dataset Name</label>
                            <input
                                type="text"
                                placeholder="analytics_data"
                                className="input-field font-mono text-sm"
                                value={bqDatasetId}
                                onChange={(e) => setBqDatasetId(e.target.value)}
                                onBlur={() => {
                                    const val = bqDatasetId.trim();
                                    if (val.includes('.')) {
                                        setBqDatasetId(val.split('.').pop() || val);
                                    }
                                }}
                                disabled={loading}
                            />
                            <p className="text-[10px] text-secondary-400">
                                The dataset containing your table (e.g. &quot;analytics_data&quot;).
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-secondary-500 uppercase tracking-widest">Table Name</label>
                            <input
                                type="text"
                                placeholder="sales_2025_2026"
                                className="input-field font-mono text-sm"
                                value={bqTableId}
                                onChange={(e) => setBqTableId(e.target.value)}
                                onBlur={() => {
                                    const val = bqTableId.trim();
                                    if (val.includes('.')) {
                                        setBqTableId(val.split('.').pop() || val);
                                    }
                                }}
                                disabled={loading}
                            />
                            <p className="text-[10px] text-secondary-400">
                                The specific table to connect (e.g. &quot;sales_2025_2026&quot;). NOT the dataset name again.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Full Path: <span className="font-mono font-bold bg-white/50 px-1 rounded ml-1">{bqProjectId && bqDatasetId && bqTableId ? `${bqProjectId}.${bqDatasetId}.${bqTableId}` : '...'}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-primary-50/30 border-t border-primary-50 flex justify-end gap-3">
                    <button onClick={onClose} className="btn-ghost" disabled={loading}>Cancel</button>
                    <button
                        onClick={handleConnect}
                        className="btn-primary"
                        disabled={loading || !bqProjectId.trim() || !bqDatasetId.trim() || !bqTableId.trim()}
                    >
                        {loading ? "Connecting..." : "Connect Table"}
                    </button>
                </div>
            </div>
        </div>
    );
}
