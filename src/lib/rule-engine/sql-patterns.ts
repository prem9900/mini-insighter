// SQL pattern templates for different query types
import { QueryIntent } from '@/types/insight';
import { BigQueryField } from '@/types/dataset';

/**
 * Generate SQL from intent and schema
 */
export function generateSQL(
    intent: QueryIntent,
    tableName: string,
    schema: BigQueryField[],
    question: string
): string {
    const lowerQuestion = question.toLowerCase();
    const hasWord = (word: string) => new RegExp(`\\b${word}\\b`, 'i').test(lowerQuestion);

    switch (intent.type) {
        case 'aggregation':
            return generateAggregationSQL(intent, tableName, schema, lowerQuestion, hasWord);

        case 'grouping':
            return generateGroupingSQL(intent, tableName, schema, lowerQuestion);

        case 'time-series':
            return generateTimeSeriesSQL(intent, tableName, schema, lowerQuestion);

        case 'list':
        default:
            return generateListSQL(tableName, schema, intent);
    }
}

/**
 * Generate aggregation SQL (SUM, AVG, COUNT, etc.)
 */
function generateAggregationSQL(
    intent: QueryIntent,
    tableName: string,
    schema: BigQueryField[],
    question: string,
    hasWord: (w: string) => boolean
): string {
    const operation = intent.operation?.toUpperCase() || 'COUNT';
    const numericColumn = findNumericColumn(schema, question);
    const whereClause = generateWhereClause(intent);

    // Special handling for "Highest/Top" without grouping - usually needs a sort instead of MAX()
    if (operation === 'MAX' && (hasWord('highest') || hasWord('top'))) {
        const sortCol = numericColumn || 'sales';
        // Find a descriptive column to show (product, category, etc)
        const displayCol = schema.find(f => f.type === 'STRING' && f.name !== 'customer')?.name || 'product';
        return `SELECT ${displayCol}, ${sortCol} FROM \`${tableName}\`${whereClause} ORDER BY ${sortCol} DESC LIMIT 1`;
    }

    if (operation === 'COUNT') {
        return `SELECT COUNT(*) as count FROM \`${tableName}\`${whereClause}`;
    }

    if (numericColumn) {
        return `SELECT ${operation}(${numericColumn}) as result FROM \`${tableName}\`${whereClause}`;
    }

    return `SELECT COUNT(*) as count FROM \`${tableName}\`${whereClause}`;
}

/**
 * Generate grouping SQL
 */
function generateGroupingSQL(
    intent: QueryIntent,
    tableName: string,
    schema: BigQueryField[],
    question: string
): string {
    const groupByColumns = intent.groupBy || [];
    const numericColumn = findNumericColumn(schema, question);
    const whereClause = generateWhereClause(intent);

    // Find matching columns in schema
    const matchedColumns = groupByColumns
        .map(term => findMatchingColumn(schema, term))
        .filter(col => col !== null);

    if (matchedColumns.length === 0) {
        // Fallback to category only if it exists in schema
        const fallbackCol = schema.find(f => f.name === 'category')?.name ||
            schema.find(f => f.type === 'STRING')?.name ||
            schema[0]?.name;
        matchedColumns.push(fallbackCol);
    }

    const groupCol = matchedColumns[0];
    const aggregation = numericColumn ? `SUM(${numericColumn})` : 'COUNT(*)';

    return `SELECT ${groupCol}, ${aggregation} as value FROM \`${tableName}\`${whereClause} GROUP BY ${groupCol} ORDER BY value DESC LIMIT 10`;
}

/**
 * Generate time series SQL
 */
function generateTimeSeriesSQL(
    intent: QueryIntent,
    tableName: string,
    schema: BigQueryField[],
    question: string
): string {
    const numericColumn = findNumericColumn(schema, question);
    const aggregation = numericColumn ? `SUM(${numericColumn})` : 'COUNT(*)';
    const whereClause = generateWhereClause(intent);

    // Determine time granularity
    let timeFormat = 'DATE_TRUNC(date, MONTH)';
    if (question.includes('day')) {
        timeFormat = 'DATE_TRUNC(date, DAY)';
    } else if (question.includes('year')) {
        timeFormat = 'DATE_TRUNC(date, YEAR)';
    } else if (question.includes('week')) {
        timeFormat = 'DATE_TRUNC(date, WEEK)';
    }

    return `SELECT ${timeFormat} as time_period, ${aggregation} as value FROM \`${tableName}\`${whereClause} GROUP BY time_period ORDER BY time_period`;
}

/**
 * Generate list SQL
 */
function generateListSQL(
    tableName: string,
    schema: BigQueryField[],
    intent: QueryIntent
): string {
    const whereClause = generateWhereClause(intent);
    const columns = schema.slice(0, 5).map(f => f.name).join(', ');
    return `SELECT ${columns} FROM \`${tableName}\`${whereClause} LIMIT 100`;
}

/**
 * Generate WHERE clause from filters
 */
function generateWhereClause(intent: QueryIntent): string {
    if (!intent.filters || intent.filters.length === 0) {
        return '';
    }

    const conditions = intent.filters.map(f => {
        const val = typeof f.value === 'string' ? `'${f.value}'` : f.value;
        return `${f.column} ${f.operator} ${val}`;
    });

    return ` WHERE ${conditions.join(' AND ')}`;
}

/**
 * Find numeric column from schema
 */
function findNumericColumn(schema: BigQueryField[], question: string): string | null {
    // Try to find column mentioned in question
    const numericTypes = ['INTEGER', 'FLOAT', 'NUMERIC', 'INT64', 'FLOAT64'];

    for (const field of schema) {
        if (numericTypes.includes(field.type)) {
            const fieldNameLower = field.name.toLowerCase();
            if (question.includes(fieldNameLower)) {
                return field.name;
            }
        }
    }

    // Return first numeric column
    const numericField = schema.find(f => numericTypes.includes(f.type));
    return numericField?.name || null;
}

/**
 * Find matching column by term
 */
function findMatchingColumn(schema: BigQueryField[], term: string): string | null {
    const field = schema.find(f => f.name.toLowerCase().includes(term));
    return field?.name || null;
}
