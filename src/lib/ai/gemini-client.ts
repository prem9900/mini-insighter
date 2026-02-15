import { DEFAULT_GEMINI_MODEL } from '@/lib/constants/gemini-models';

export class GeminiClient {
    private apiKey: string;
    private model: string;

    constructor(apiKey: string, model: string = DEFAULT_GEMINI_MODEL) {
        this.apiKey = apiKey;
        this.model = model;
    }

    async generateSQL(userQuestion: string, tableName: string, schema: unknown[]): Promise<{ sql: string }> {
        const schemaStr = JSON.stringify(schema, null, 2);
        const prompt = `
            You are a BigQuery SQL expert. Convert the following natural language question into a valid BigQuery SQL query.
            
            Table Name: \`${tableName}\`
            Schema: ${schemaStr}
            
            Rules:
            1. Return ONLY the SQL query. 
            2. Do not use block quotes or markdown.
            3. Always wrap table names in backticks.
            4. Use LIMIT 100 if not specified.
            5. CRITICAL: The table is partitioned by 'order_date'. You MUST include a filter on 'order_date' (e.g. WHERE order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)) unless a specific date range is requested. Without this filter, the query will fail.
            
            Question: ${userQuestion}
            SQL:`;

        const response = await this.callGemini(prompt);
        return { sql: response.trim() };
    }

    async generateSummary(question: string, results: unknown[]): Promise<string> {
        const resultsStr = JSON.stringify(results.slice(0, 10));
        const prompt = `
            Based on the following data results from a BigQuery query, provide a concise, human-friendly summary answering the user's question.
            
            Question: ${question}
            Results (First 10 rows): ${resultsStr}
            
            Summary:`;

        return await this.callGemini(prompt);
    }

    private async callGemini(prompt: string): Promise<string> {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }
}
