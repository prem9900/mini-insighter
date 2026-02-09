// BigQuery client configuration
import { BigQuery } from '@google-cloud/bigquery';

// Helper to get BigQuery credentials configuration
const getBigQueryConfig = () => {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    let credsJson = process.env.BIGQUERY_SERVICE_ACCOUNT_JSON;

    console.log('BigQuery Config: Initializing with Project ID:', projectId || 'UNDEFINED');

    if (!projectId) {
        throw new Error('GOOGLE_CLOUD_PROJECT environment variable is missing. Check your .env.local file.');
    }

    if (!credsJson) {
        console.warn('BigQuery Config: BIGQUERY_SERVICE_ACCOUNT_JSON is missing. Will attempt to use application default credentials.');
        return { projectId };
    }

    // DEBUG: Look for hidden characters
    console.log('BigQuery Config: Raw length:', credsJson.length);
    console.log('BigQuery Config: First 20 chars (codes):',
        credsJson.substring(0, 20).split('').map(c => c.charCodeAt(0)).join(', '));

    // Clean up potential surrounding quotes and whitespace
    credsJson = credsJson.trim();
    if ((credsJson.startsWith("'") && credsJson.endsWith("'")) ||
        (credsJson.startsWith('"') && credsJson.endsWith('"'))) {
        credsJson = credsJson.slice(1, -1).trim();
    }

    // More aggressive check for JSON: search for first '{'
    if (credsJson.includes('{')) {
        const firstBrace = credsJson.indexOf('{');
        const lastBrace = credsJson.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
            const potentialJson = credsJson.substring(firstBrace, lastBrace + 1);
            try {
                const credentials = JSON.parse(potentialJson);

                // Fix for the common "DECODER unsupported" / "malformed private key" error
                // Sometimes env vars have literal \n which need to be actual newlines
                if (credentials.private_key && typeof credentials.private_key === 'string') {
                    if (credentials.private_key.includes('\\n')) {
                        console.log('BigQuery Config: Fixing literal \\n in private_key');
                        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
                    }
                }

                console.log('BigQuery Config: Successfully parsed credentials JSON after cleaning');
                return {
                    projectId,
                    credentials,
                };
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error('BigQuery Config: Failed to parse JSON even after cleaning. Error:', errorMessage);
                console.error('JSON attempted:', potentialJson.substring(0, 100) + '...');
                // If it looks like JSON, don't fallback to filename - throw error
                throw new Error('BigQuery credentials look like JSON but are malformed: ' + errorMessage);
            }
        }
    }

    console.log('BigQuery Config: Falling back to keyFilename approach with:', credsJson.substring(0, 50) + '...');
    return {
        projectId,
        keyFilename: credsJson,
    };
};

// Initialize BigQuery client
// We wrap it in a function or use a getter to allow for environment variables to be loaded first
let client: BigQuery | null = null;
export const getBigQueryClient = () => {
    if (!client) {
        client = new BigQuery(getBigQueryConfig());
    }
    return client;
};

export const bigQueryClient = getBigQueryClient();



/**
 * Test BigQuery connection
 * @returns Promise<boolean> - true if connection successful
 */
export async function testConnection(): Promise<boolean> {
    try {
        const query = 'SELECT 1 as test';
        const [rows] = await bigQueryClient.query({ query });
        return rows.length > 0;
    } catch (error) {
        console.error('BigQuery connection test failed:', error);
        return false;
    }
}

/**
 * Execute a SQL query in BigQuery
 * @param sql - SQL query string
 * @returns Promise with query results
 */
export async function executeQuery(sql: string): Promise<Record<string, unknown>[]> {
    try {
        const [rows] = await bigQueryClient.query({ query: sql });
        return rows;
    } catch (error) {
        console.error('BigQuery query execution failed:', error);
        throw error;
    }
}

/**
 * Get table schema from BigQuery
 * @param projectId - GCP project ID
 * @param datasetId - BigQuery dataset ID
 * @param tableId - BigQuery table ID
 * @returns Promise with table schema
 */
export async function getTableSchema(
    projectId: string,
    datasetId: string,
    tableId: string
) {
    try {
        // Normalize IDs: if the user provides fully qualified names (e.g. "project.dataset.table")
        // we only need the last part for the SDK methods
        const cleanDatasetId = datasetId.includes('.') ? datasetId.split('.').pop()! : datasetId;
        const cleanTableId = tableId.includes('.') ? tableId.split('.').pop()! : tableId;

        console.log(`BigQuery: Fetching schema for ${projectId}.${cleanDatasetId}.${cleanTableId}`);

        const dataset = bigQueryClient.dataset(cleanDatasetId, { projectId });
        const table = dataset.table(cleanTableId);
        const [metadata] = await table.getMetadata();
        return metadata.schema;
    } catch (error) {
        console.error('Failed to get table schema:', error);
        throw error;
    }
}
