"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface LinkDatasetModalProps {
    projectId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function LinkDatasetModal({ projectId, onClose, onSuccess }: LinkDatasetModalProps) {
    const [bigqueryProjectId, setBigqueryProjectId] = useState('');
    const [bigqueryDatasetId, setBigqueryDatasetId] = useState('');
    const [bigqueryTableId, setBigqueryTableId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('Not authenticated');
                setLoading(false);
                return;
            }

            const response = await fetch('/api/datasets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_id: projectId,
                    bigquery_project_id: bigqueryProjectId.trim(),
                    bigquery_dataset_id: bigqueryDatasetId.trim(),
                    bigquery_table_id: bigqueryTableId.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to link dataset');
                setLoading(false);
                return;
            }

            // Success
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-8 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Link BigQuery Dataset</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            BigQuery Project ID
                        </label>
                        <input
                            type="text"
                            value={bigqueryProjectId}
                            onChange={(e) => setBigqueryProjectId(e.target.value)}
                            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-black"
                            placeholder="my-gcp-project"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Your Google Cloud Platform project ID
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            BigQuery Dataset ID
                        </label>
                        <input
                            type="text"
                            value={bigqueryDatasetId}
                            onChange={(e) => setBigqueryDatasetId(e.target.value)}
                            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-black"
                            placeholder="analytics_data"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            The dataset name in BigQuery
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            BigQuery Table ID
                        </label>
                        <input
                            type="text"
                            value={bigqueryTableId}
                            onChange={(e) => setBigqueryTableId(e.target.value)}
                            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-black"
                            placeholder="sales_data"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            The table name in the dataset
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border rounded-lg font-semibold hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Linking...' : 'Link Dataset'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-900 font-bold mb-2 flex items-center gap-2">
                        <span className="text-lg">💡</span> Where to find these values:
                    </p>
                    <ol className="text-xs text-gray-600 space-y-2 list-decimal list-inside font-medium ml-1">
                        <li>Go to BigQuery Console</li>
                        <li>Find your project in the left sidebar</li>
                        <li>Expand it to see datasets</li>
                        <li>Expand a dataset to see tables</li>
                        <li>Copy the IDs from there</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
