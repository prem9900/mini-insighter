// Result formatter - transforms BigQuery results and detects visualization type
import { InsightResult, ChartData } from '@/types/insight';
import { VisualizationType } from '@/types/chat';

/**
 * Format BigQuery results and determine visualization type
 */
export function formatResults(rawResults: Record<string, unknown>[], sql: string): InsightResult {
    const visualizationType = detectVisualizationType(rawResults);

    // Normalize data (handle BigQuery Date/Timestamp objects)
    const normalizedData = rawResults.map(row => {
        const newRow: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(row)) {
            // BigQuery Date/Timestamp objects often have a 'value' property
            if (value && typeof value === 'object' && 'value' in value) {
                newRow[key] = String((value as Record<string, unknown>).value);
            } else {
                newRow[key] = value;
            }
        }
        return newRow;
    });

    return {
        sql,
        data: normalizedData,
        visualization_type: visualizationType,
        metadata: {
            row_count: normalizedData.length,
        },
    };
}

/**
 * Detect the best visualization type based on result structure
 */
function detectVisualizationType(results: Record<string, unknown>[]): VisualizationType {
    if (!results || results.length === 0) {
        return 'none';
    }

    const firstRow = results[0];
    const keys = Object.keys(firstRow);

    // Single value (KPI)
    if (results.length === 1 && keys.length === 1) {
        return 'kpi';
    }

    // Two columns with one being numeric - likely grouped data (bar chart)
    if (keys.length === 2) {
        const hasNumericValue = keys.some(key => typeof firstRow[key] === 'number');
        if (hasNumericValue) {
            // Check if first column looks like a time period
            const firstKey = keys[0];
            const firstValue = firstRow[firstKey];
            if (firstValue instanceof Date || typeof firstValue === 'string' && firstValue.match(/\d{4}-\d{2}/)) {
                return 'line';
            }
            return 'bar';
        }
    }

    // Multiple rows with few columns - table
    if (results.length <= 100) {
        return 'table';
    }

    return 'table';
}

/**
 * Transform results into chart data format
 */
export function toChartData(results: Record<string, unknown>[]): ChartData {
    if (!results || results.length === 0) {
        return { labels: [], values: [] };
    }

    const keys = Object.keys(results[0]);
    const labelKey = keys[0];
    const valueKey = keys[1] || keys[0];

    return {
        labels: results.map(row => String(row[labelKey])),
        values: results.map(row => Number(row[valueKey]) || 0),
    };
}
