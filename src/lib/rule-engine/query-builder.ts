// Main query builder - orchestrates intent detection and SQL generation
import { detectIntent } from './intent-detector';
import { generateSQL } from './sql-patterns';
import { BigQueryField } from '@/types/dataset';
import { QueryIntent } from '@/types/insight';

export interface QueryBuilderResult {
    sql: string;
    intent: QueryIntent;
}

/**
 * Build SQL query from natural language question
 * @param question - User's natural language question
 * @param tableName - Fully qualified BigQuery table name (project.dataset.table)
 * @param schema - BigQuery table schema
 * @returns SQL query and detected intent
 */
export function buildQuery(
    question: string,
    tableName: string,
    schema: BigQueryField[]
): QueryBuilderResult {
    // Step 1: Detect intent from question
    const intent = detectIntent(question);

    // Step 2: Generate SQL from intent
    const sql = generateSQL(intent, tableName, schema, question);

    return {
        sql,
        intent,
    };
}
