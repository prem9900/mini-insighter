// Chat types
export type MessageRole = 'user' | 'assistant';

export interface Message {
    id: string;
    chat_id: string;
    role: MessageRole;
    content: string;
    sql_query?: string;
    query_results?: Record<string, unknown>[];
    visualization_type?: VisualizationType;
    created_at: string;
}

export interface Chat {
    id: string;
    project_id: string;
    user_id: string;
    title?: string;
    created_at: string;
    updated_at: string;
    messages?: Message[];
}

export interface CreateChatInput {
    project_id: string;
    title?: string;
}

export type VisualizationType = 'kpi' | 'table' | 'bar' | 'line' | 'none';
