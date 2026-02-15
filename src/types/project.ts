// Project types
export interface Project {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    gemini_api_key?: string;
    gemini_model?: string;
    dataset_id?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateProjectInput {
    name: string;
    description?: string;
}

export interface UpdateProjectInput {
    name?: string;
    description?: string;
    gemini_api_key?: string;
    gemini_model?: string;
}
