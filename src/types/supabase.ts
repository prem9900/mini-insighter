export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            projects: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    user_id: string
                    created_at: string
                    gemini_api_key: string | null
                    gemini_model: string | null
                    dataset_id: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    user_id: string
                    created_at?: string
                    gemini_api_key?: string | null
                    gemini_model?: string | null
                    dataset_id?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    user_id?: string
                    created_at?: string
                    gemini_api_key?: string | null
                    gemini_model?: string | null
                    dataset_id?: string | null
                }
            }
            datasets: {
                Row: {
                    id: string
                    project_id: string
                    bigquery_table_id: string
                    schema_json: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    bigquery_table_id: string
                    schema_json?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    bigquery_table_id?: string
                    schema_json?: Json
                    created_at?: string
                }
            }
        }
    }
}
