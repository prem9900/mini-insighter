// Dataset types
export interface Dataset {
    id: string;
    project_id: string;
    bigquery_project_id: string;
    bigquery_dataset_id: string;
    bigquery_table_id: string;
    schema_json?: BigQuerySchema;
    created_at: string;
}

export interface BigQuerySchema {
    fields: BigQueryField[];
}

export interface BigQueryField {
    name: string;
    type: string;
    mode?: string;
    description?: string;
}

export interface CreateDatasetInput {
    project_id: string;
    bigquery_project_id: string;
    bigquery_dataset_id: string;
    bigquery_table_id: string;
}
