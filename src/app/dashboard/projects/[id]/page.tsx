"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Message } from '@/types/chat';
import { Dataset } from '@/types/dataset';
import Link from 'next/link';
import LinkDatasetModal from '@/components/LinkDatasetModal';

export default function ProjectChatPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const [dataset, setDataset] = useState<Dataset | null>(null);
    const [loadingDataset, setLoadingDataset] = useState(true);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [projectName, setProjectName] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        checkAuth();
        loadProjectDetails();
        loadDataset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (dataset) {
            createChat();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataset]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function checkAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login');
        }
    }

    async function loadProjectDetails() {
        // Fetch project name for the header
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data } = await supabase
            .from('projects')
            .select('name')
            .eq('id', params.id)
            .single();

        if (data) {
            setProjectName(data.name);
        }
    }

    async function loadDataset() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch(`/api/datasets?project_id=${params.id}`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            const data = await response.json();
            if (data.datasets && data.datasets.length > 0) {
                setDataset(data.datasets[0]);
            }
        } catch (error) {
            console.error('Error loading dataset:', error);
        } finally {
            setLoadingDataset(false);
        }
    }

    async function createChat() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data } = await supabase
                .from('chats')
                .insert({
                    project_id: params.id,
                    user_id: session.user.id,
                    title: 'New Chat',
                })
                .select()
                .single();

            if (data) {
                setChatId(data.id);
            }
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    }

    async function sendMessage() {
        if (!input.trim() || loading || !chatId) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            chat_id: chatId,
            role: 'user',
            content: input,
            created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch('/api/insights/query', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: userMessage.content,
                    projectId: params.id,
                    chatId: chatId,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Check if there's a special message (like for greetings)
                const messageContent = data.result.metadata?.message
                    ? data.result.metadata.message
                    : `Found ${data.result.data.length} results`;

                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    chat_id: chatId,
                    role: 'assistant',
                    content: messageContent,
                    sql_query: data.result.sql,
                    query_results: data.result.data,
                    visualization_type: data.result.visualization_type,
                    created_at: new Date().toISOString(),
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    chat_id: chatId,
                    role: 'assistant',
                    content: `Error: ${data.error}`,
                    created_at: new Date().toISOString(),
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error: unknown) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                chat_id: chatId,
                role: 'assistant',
                content: `Error: ${error instanceof Error ? error.message : String(error)}`,
                created_at: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    }

    // Show dataset linking requirement
    if (loadingDataset) {
        return (
            <div className="flex items-center justify-center h-screen bg-zinc-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-zinc-900 mx-auto mb-4"></div>
                    <p className="text-zinc-500 font-medium">Loading workspace...</p>
                </div>
            </div>
        );
    }

    if (!dataset) {
        return (
            <div className="flex flex-col h-screen bg-zinc-50 bg-grid-pattern">
                <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                            <span className="font-medium">Back</span>
                        </Link>
                        <h1 className="font-heading font-bold text-lg text-zinc-900">{projectName || 'Project Chat'}</h1>
                        <div className="w-8"></div> {/* Spacer for center alignment */}
                    </div>
                </header>

                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md border border-yellow-100">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-zinc-900 font-heading">No Dataset Linked</h2>
                        <p className="text-zinc-500 mb-8 leading-relaxed">
                            Connect your BigQuery dataset to start generating insights from your data.
                        </p>
                        <button
                            onClick={() => setShowLinkModal(true)}
                            className="w-full btn-primary"
                        >
                            Link BigQuery Dataset
                        </button>
                    </div>
                </div>

                {showLinkModal && (
                    <LinkDatasetModal
                        projectId={params.id}
                        onClose={() => setShowLinkModal(false)}
                        onSuccess={() => {
                            setShowLinkModal(false);
                            loadDataset();
                        }}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-zinc-50/50 bg-grid-pattern font-sans relative">
            {/* Header */}
            <header className="h-14 sm:h-16 border-b border-zinc-200 bg-white px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-1 sm:gap-2 text-black hover:bg-zinc-100 px-2 sm:px-3 py-2 rounded-lg -ml-2 sm:-ml-3 transition-colors shrink-0"
                        title="Back to Dashboard"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[22px] sm:h-[22px]">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        <span className="font-extrabold text-sm sm:text-base hidden sm:inline">Dashboard</span>
                    </Link>
                    <div className="h-5 sm:h-6 w-px bg-zinc-300 shrink-0"></div>
                    <div className="flex flex-col overflow-hidden">
                        <h1 className="text-base sm:text-xl font-black text-black tracking-tight leading-none truncate">{projectName || 'Project Chat'}</h1>
                        {dataset && (
                            <span className="text-[10px] sm:text-xs font-extrabold text-black tracking-wide truncate" title={dataset.bigquery_table_id}>
                                {dataset.bigquery_table_id.split('.').pop()}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-black bg-zinc-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-zinc-300">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[14px] sm:h-[14px]"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                        <span className="hidden sm:inline">BigQuery Connected</span>
                        <span className="sm:hidden">Connected</span>
                        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-600 rounded-full ml-1 animate-pulse"></span>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-6 sm:space-y-8 scroll-smooth" ref={messagesEndRef}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center animate-in fade-in zoom-in-95 duration-500 px-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white to-zinc-50 rounded-3xl flex items-center justify-center mb-6 sm:mb-8 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <span className="text-3xl sm:text-4xl">✨</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-2 sm:mb-3 tracking-tight font-heading">Ready for insights?</h3>
                        <p className="text-zinc-500 max-w-md leading-relaxed text-base sm:text-lg font-light">
                            Ask questions about your data in natural language. Try &quot;Show sales trend&quot; or &quot;Top performing regions&quot;.
                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div
                            className={`max-w-[90%] sm:max-w-[85%] md:max-w-4xl rounded-2xl p-4 sm:p-6 shadow-sm ${message.role === 'user'
                                ? 'bg-zinc-900 text-white shadow-lg rounded-tr-md'
                                : 'bg-white border border-white/40 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-sm rounded-tl-md'
                                }`}
                        >
                            <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-[15px] break-words">{message.content}</p>

                            {message.sql_query && (
                                <div className="mt-4 sm:mt-5 rounded-lg border border-zinc-100 overflow-hidden bg-zinc-50/50">
                                    <div className="px-3 sm:px-4 py-2 bg-zinc-100/50 border-b border-zinc-100 flex items-center gap-2">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500"><path d="M4 17l6-6-6-6M12 19h8" /></svg>
                                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">SQL Query</span>
                                    </div>
                                    <div className="p-3 sm:p-4 overflow-x-auto">
                                        <code className="text-[10px] sm:text-xs font-mono text-zinc-600 whitespace-pre">{message.sql_query}</code>
                                    </div>
                                </div>
                            )}

                            {message.query_results && message.visualization_type && (
                                <div className="mt-4 sm:mt-6 w-full overflow-hidden">
                                    <InsightVisualization
                                        data={message.query_results}
                                        type={message.visualization_type}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/80 border border-white/20 rounded-2xl rounded-tl-md p-3 sm:p-4 shadow-sm inline-flex backdrop-blur-sm">
                            <div className="flex gap-1.5 items-center">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-zinc-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Spacer for bottom input */}
                <div className="h-24 sm:h-28"></div>
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-6 z-40 flex justify-center pointer-events-none">
                <div className="w-full max-w-3xl pointer-events-auto">
                    <div className="relative group rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] bg-white/90 backdrop-blur-xl border border-white/20 transition-all duration-300 focus-within:shadow-[0_12px_50px_rgba(0,0,0,0.12)] focus-within:-translate-y-1">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask a question..."
                            className="w-full bg-transparent border-none rounded-2xl pl-4 sm:pl-5 pr-12 sm:pr-14 py-3 sm:py-4 outline-none text-base sm:text-lg font-medium text-black placeholder:text-zinc-500 placeholder:font-medium"
                            disabled={loading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="absolute right-1.5 sm:right-2 top-1.5 sm:top-2 bottom-1.5 sm:bottom-2 aspect-square p-2 bg-zinc-900 rounded-xl text-white hover:bg-zinc-800 transition-all disabled:opacity-0 disabled:scale-95 shadow-md flex items-center justify-center"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[20px] sm:h-[20px]"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Visualization Component
function InsightVisualization({ data, type }: { data: Record<string, unknown>[]; type: string }) {
    if (!data || data.length === 0) {
        return <p className="text-zinc-500 text-sm italic">No data to display in visualization.</p>;
    }

    if (type === 'kpi') {
        const value = Object.values(data[0])[0];
        const key = Object.keys(data[0])[0];
        return (
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white p-6 sm:p-8 rounded-xl text-center shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="sm:w-[60px] sm:h-[60px]"><path d="M12 2v20M2 12h20" /></svg>
                </div>
                <div className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.2em] text-zinc-400 mb-2 sm:mb-3">{key.replace(/_/g, ' ')}</div>
                <div className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight break-all">{String(value)}</div>
            </div>
        );
    }

    if (type === 'table') {
        const keys = Object.keys(data[0]);
        return (
            <div className="overflow-hidden rounded-xl border border-zinc-200 shadow-sm bg-white max-w-full">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-zinc-50/80 border-b border-zinc-200">
                            <tr>
                                {keys.map(key => (
                                    <th key={key} className="px-4 sm:px-6 py-3 sm:py-4 text-left font-bold text-zinc-700 uppercase tracking-wider text-[10px] sm:text-[11px] whitespace-nowrap">{key.replace(/_/g, ' ')}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {data.slice(0, 10).map((row, i) => (
                                <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                                    {keys.map(key => (
                                        <td key={key} className="px-4 sm:px-6 py-3 sm:py-4 text-zinc-600 font-medium whitespace-nowrap text-xs sm:text-sm">{String(row[key])}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {data.length > 10 && (
                    <div className="px-4 sm:px-6 py-2 sm:py-3 bg-zinc-50 border-t border-zinc-200 text-xs text-zinc-500 font-medium text-center">
                        Showing first 10 rows of {data.length} results
                    </div>
                )}
            </div>
        );
    }

    if (type === 'bar' || type === 'line') {
        const keys = Object.keys(data[0]);
        const labelKey = keys[0]; // Assume first is label
        const valueKey = keys[1]; // Assume second is value
        const maxValue = Math.max(...data.map(d => Number(d[valueKey]) || 0));

        return (
            <div className="space-y-4 sm:space-y-5 p-1 sm:p-2">
                {data.slice(0, 10).map((row, i) => {
                    const value = Number(row[valueKey]) || 0;
                    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    return (
                        <div key={i} className="group">
                            <div className="flex justify-between text-xs mb-1.5 sm:mb-2 items-end">
                                <span className="font-bold text-zinc-700 truncate max-w-[150px] sm:max-w-[200px]">{String(row[labelKey])}</span>
                                <span className="text-zinc-500 font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-[10px] sm:text-xs">{String(row[valueKey])}</span>
                            </div>
                            <div className="w-full bg-zinc-100 rounded-full h-2 sm:h-2.5 overflow-hidden">
                                <div
                                    className="bg-zinc-900 h-2 sm:h-2.5 rounded-full transition-all duration-1000 ease-out group-hover:bg-zinc-700 relative"
                                    style={{ width: `${percentage}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20"></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return <p className="text-zinc-500 text-sm border-l-2 border-zinc-300 pl-4 py-2">Visualization type &apos;{type}&apos; not supported.</p>;
}
