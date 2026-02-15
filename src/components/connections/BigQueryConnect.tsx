"use client";

import { useState } from 'react';
import LinkDatasetModal from './LinkDatasetModal';

interface BigQueryConnectProps {
    projectId: string;
    onConnected: () => void;
}

export default function BigQueryConnect({ projectId, onConnected }: BigQueryConnectProps) {
    const [showLinkModal, setShowLinkModal] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
            <div className="bg-primary-50 p-6 rounded-full">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 7v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7" />
                    <path d="M10 12h4" />
                </svg>
            </div>

            <div className="max-w-md space-y-2">
                <h2 className="text-2xl font-heading font-bold text-secondary-900">Connect BigQuery Data</h2>
                <p className="text-secondary-500">
                    To start generating insights, you need to connect a BigQuery dataset to this project.
                </p>
            </div>

            <button
                onClick={() => setShowLinkModal(true)}
                className="btn-primary flex items-center gap-2"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                </svg>
                Connect Dataset
            </button>

            {showLinkModal && (
                <LinkDatasetModal
                    projectId={projectId}
                    onClose={() => setShowLinkModal(false)}
                    onSuccess={() => {
                        setShowLinkModal(false);
                        onConnected();
                    }}
                />
            )}
        </div>
    );
}
