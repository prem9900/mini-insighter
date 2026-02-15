import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    sql?: string;
    data?: Record<string, unknown>[];
    visualization_type?: 'table' | 'bar' | 'line' | 'single_value';
}

const SUGGESTED_QUERIES = [
    "Show me total sales by month",
    "Who are the top 5 customers?",
    "Count active users by country",
    "What is the average order value?"
];

export default function ChatInterface({ projectId }: { projectId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    const handleSend = async (text: string = input) => {
        const queryText = text.trim();
        if (!queryText || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: queryText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch('/api/insights/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    projectId,
                    query: userMessage.content
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get insights');
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.answer,
                timestamp: new Date(),
                sql: data.sql,
                data: data.data,
                visualization_type: data.visualization_type
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm sorry, I encountered an error while processing your request. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-50/50 relative">
            <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-8 pb-32">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in duration-500">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-zinc-100">
                                <svg className="text-zinc-900" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            </div>
                            <h3 className="text-2xl font-heading font-bold text-zinc-900 mb-2">
                                Insight AI
                            </h3>
                            <p className="text-zinc-500 max-w-md mb-10 text-lg">
                                Ask questions about your data in plain English.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                                {SUGGESTED_QUERIES.map((query, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(query)}
                                        className="p-4 text-left bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl shadow-sm hover:shadow hover:-translate-y-0.5 transition-all group"
                                    >
                                        <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">{query}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex w-full animate-in duration-300 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                                <div className={`p-5 rounded-2xl shadow-sm ${msg.role === 'user'
                                    ? 'bg-zinc-900 text-white rounded-br-sm'
                                    : 'bg-white text-zinc-900 rounded-bl-sm border border-zinc-100'
                                    }`}>
                                    <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                                        <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                                    </div>

                                    {msg.role === 'assistant' && msg.sql && (
                                        <div className="mt-5 pt-4 border-t border-zinc-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Generated SQL</span>
                                            </div>
                                            <div className="bg-zinc-950 text-zinc-100 p-4 rounded-xl overflow-x-auto font-mono text-xs leading-relaxed border border-zinc-800 shadow-inner">
                                                {msg.sql}
                                            </div>

                                            {msg.data && msg.data.length > 0 && (
                                                <div className="mt-6">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Result Data</span>
                                                    </div>
                                                    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm ring-1 ring-black/5">
                                                        <div className="overflow-x-auto max-h-[400px]">
                                                            <table className="min-w-full divide-y divide-zinc-200 text-sm">
                                                                <thead className="bg-zinc-50/80 sticky top-0 backdrop-blur-sm z-10">
                                                                    <tr>
                                                                        {Object.keys(msg.data[0]).map((key) => (
                                                                            <th key={key} className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider whitespace-nowrap">
                                                                                {key.replace(/_/g, ' ')}
                                                                            </th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-zinc-100 bg-white">
                                                                    {msg.data.map((row, i) => (
                                                                        <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                                                                            {Object.values(row).map((val: unknown, j) => (
                                                                                <td key={j} className="px-4 py-3 whitespace-nowrap text-zinc-700 font-medium">
                                                                                    {val?.toString() || '-'}
                                                                                </td>
                                                                            ))}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        <div className="bg-zinc-50 px-4 py-2 border-t border-zinc-200 text-xs text-zinc-500 flex justify-between">
                                                            <span>{msg.data.length} rows</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className={`text-[11px] mt-3 font-medium opacity-60 flex items-center gap-1 ${msg.role === 'user' ? 'justify-end text-white/80' : 'text-zinc-400'}`}>
                                        {msg.role === 'assistant' && (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                        )}
                                        {format(msg.timestamp, 'p')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start w-full animate-pulse">
                            <div className="bg-white rounded-2xl rounded-bl-sm border border-zinc-100 p-5 flex items-center gap-3 shadow-sm">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-10">
                <div className="max-w-3xl mx-auto">
                    <div className="relative bg-white rounded-2xl shadow-lift border border-zinc-200 hover:border-zinc-300 transition-all focus-within:ring-2 focus-within:ring-zinc-900/10 focus-within:border-zinc-900/20 overflow-hidden">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a question about your data..."
                            className="w-full pl-5 pr-14 py-4 bg-transparent border-0 focus:ring-0 resize-none max-h-[200px] min-h-[56px] text-zinc-900 placeholder:text-zinc-400 text-lg leading-relaxed"
                            rows={1}
                            disabled={loading}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || loading}
                            className="absolute right-2 bottom-2 p-2.5 bg-zinc-900 text-white rounded-xl hover:bg-black disabled:opacity-30 disabled:hover:bg-zinc-900 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
